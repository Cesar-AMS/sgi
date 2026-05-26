using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using System.Globalization;

namespace JMImoveisAPI.Services
{
    public class ProposalService : IProposalService
    {
        private const string CommissionModeAtoParcelas = "ATO_PARCELAS";
        private const int CommissionCalculationVersion = 1;

        private readonly IVendaRepository _repo;
        private readonly IClienteRepository _clienteRepository;
        private readonly IVendaCriacaoService _vendaCriacaoService;
        private readonly IAccountsReceivableService _accountsReceivableService;
        private readonly ILeadPostVisitService _leadPostVisitService;
        private readonly ILogger<ProposalService> _logger;
        private readonly ProposalCommissionCalculator _commissionCalculator = new();

        public ProposalService(
            IVendaRepository repo,
            IClienteRepository clienteRepository,
            IVendaCriacaoService vendaCriacaoService,
            IAccountsReceivableService accountsReceivableService,
            ILeadPostVisitService leadPostVisitService,
            ILogger<ProposalService> logger)
        {
            _repo = repo;
            _clienteRepository = clienteRepository;
            _vendaCriacaoService = vendaCriacaoService;
            _accountsReceivableService = accountsReceivableService;
            _leadPostVisitService = leadPostVisitService;
            _logger = logger;
        }

        public async Task<long> CreateAsync(PropostaReservaDto dto, CancellationToken ct)
        {
            if (dto is null)
            {
                throw new ArgumentException("Payload invalido.");
            }

            if (string.IsNullOrWhiteSpace(dto.UnidadeID) ||
                string.IsNullOrWhiteSpace(dto.ClienteName) ||
                string.IsNullOrWhiteSpace(dto.CnpjCPF) ||
                dto.VlrUnidade <= 0)
            {
                throw new ArgumentException("Unidade, cliente, CPF/CNPJ e valor da oferta sao obrigatorios.");
            }

            var proposal = MapProposal(dto);
            var conds = MapConditions(dto).ToList();
            await ValidateApprovalParametersAsync(proposal, conds, ct);
            AplicarResumoComissao(proposal, conds);

            var unitStatus = await _repo.GetUnitStatusAsync(proposal.UnidadeId, ct);
            if (!string.Equals((unitStatus ?? string.Empty).Trim(), "OPEN", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Unidade indisponivel para proposta.");
            }

            if (await _repo.HasActiveProposalForUnitAsync(proposal.UnidadeId, ct))
            {
                throw new InvalidOperationException("Ja existe proposta ativa para esta unidade.");
            }

            proposal.Status = ProposalStatus.EM_ANALISE.ToString();
            var proposalId = await _repo.CreateAsync(proposal, conds, ct);
            await TryMarkPostVisitAsInProposalAsync(dto.LeadId, proposalId);
            return proposalId;
        }

        public async Task<bool> UpdateAsync(long id, PropostaReservaDto dto, CancellationToken ct)
        {
            var existing = await _repo.GetByIdAsync(id, ct);
            if (existing is null)
            {
                return false;
            }

            var proposal = MapProposal(dto);
            proposal.Id = (ulong)id;
            proposal.CreatedAt = existing.CreatedAt;
            proposal.Status = NormalizeStatus(string.IsNullOrWhiteSpace(dto.Status) ? existing.Status : dto.Status);

            var conds = MapConditions(dto).ToList();
            await ValidateApprovalParametersAsync(proposal, conds, ct);
            AplicarResumoComissao(proposal, conds);
            return await _repo.UpdateProposalAsync(proposal, conds, ct);
        }

        public async Task<Proposal?> GetByIdAsync(long id, CancellationToken ct)
        {
            var proposal = await _repo.GetByIdAsync(id, ct);
            if (proposal is not null)
            {
                proposal.Status = NormalizeStatus(proposal.Status);
            }

            return proposal;
        }

        public async Task<IEnumerable<Proposal>> ListAsync(DateTime? de, DateTime? ate, string? status, int? user, int? gerente, int? coordenador, int? corretor, int? construtora, int? empreendimento, CancellationToken ct)
        {
            var proposals = await _repo.ListAsync(de, ate, NormalizeFilterStatus(status), user, gerente, coordenador, corretor, construtora, empreendimento, ct);
            foreach (var proposal in proposals)
            {
                proposal.Status = NormalizeStatus(proposal.Status);
            }

            return proposals;
        }

        public async Task<(bool Success, string? Error, Proposal? Proposal)> EnviarParaAnaliseAsync(long id, CancellationToken ct)
        {
            var proposal = await _repo.GetByIdAsync(id, ct);
            if (proposal is null)
            {
                return (false, "NOT_FOUND", null);
            }

            var currentStatus = NormalizeStatus(proposal.Status);
            if (!string.Equals(currentStatus, ProposalStatus.RASCUNHO.ToString(), StringComparison.Ordinal))
            {
                proposal.Status = currentStatus;
                return (false, "INVALID_STATUS", proposal);
            }

            var unitStatus = NormalizeUnitStatus(await _repo.GetUnitStatusAsync(proposal.UnidadeId, ct));
            if (unitStatus == "SELL")
            {
                proposal.Status = currentStatus;
                return (false, "UNIT_SOLD", proposal);
            }

            if (unitStatus == "RESERVED" && await _repo.HasActiveProposalForUnitExceptAsync(proposal.UnidadeId, id, ct))
            {
                proposal.Status = currentStatus;
                return (false, "UNIT_RESERVED", proposal);
            }

            if (unitStatus != "OPEN" && unitStatus != "RESERVED")
            {
                proposal.Status = currentStatus;
                return (false, "UNIT_STATUS_UPDATE_FAILED", proposal);
            }

            var updated = await _repo.UpdateProposalStatusAsync(id, currentStatus, ProposalStatus.EM_ANALISE.ToString(), ct);
            if (!updated)
            {
                proposal.Status = currentStatus;
                return (false, "INVALID_STATUS", proposal);
            }

            if (unitStatus == "OPEN")
            {
                var reserved = await _repo.UpdateUnitStatusIfCurrentAsync(proposal.UnidadeId, "OPEN", "RESERVED", ct);
                if (!reserved)
                {
                    await _repo.UpdateProposalStatusAsync(id, ProposalStatus.EM_ANALISE.ToString(), currentStatus, ct);
                    proposal.Status = currentStatus;
                    return (false, "UNIT_STATUS_UPDATE_FAILED", proposal);
                }
            }

            proposal.Status = ProposalStatus.EM_ANALISE.ToString();
            return (true, null, proposal);
        }

        public Task<(bool Success, string? Error, Proposal? Proposal)> AprovarAsync(long id, CancellationToken ct)
            => TransitionAsync(id, ProposalStatus.APROVADO, ct, ProposalStatus.EM_ANALISE, ProposalStatus.REPROVADO);

        public Task<(bool Success, string? Error, Proposal? Proposal)> ReprovarAsync(long id, CancellationToken ct)
            => TransitionAsync(id, ProposalStatus.REPROVADO, ct, ProposalStatus.EM_ANALISE, ProposalStatus.APROVADO);

        private async Task<(bool Success, string? Error, Proposal? Proposal)> TransitionAsync(long id, ProposalStatus expectedStatus, ProposalStatus nextStatus, CancellationToken ct)
            => await TransitionAsync(id, nextStatus, ct, expectedStatus);

        private async Task<(bool Success, string? Error, Proposal? Proposal)> TransitionAsync(long id, ProposalStatus nextStatus, CancellationToken ct, params ProposalStatus[] allowedStatuses)
        {
            var proposal = await _repo.GetByIdAsync(id, ct);
            if (proposal is null)
            {
                return (false, "NOT_FOUND", null);
            }

            var currentStatus = NormalizeStatus(proposal.Status);
            if (!allowedStatuses.Any(status => string.Equals(currentStatus, status.ToString(), StringComparison.Ordinal)))
            {
                proposal.Status = currentStatus;
                return (false, "INVALID_STATUS", proposal);
            }

            var updated = await _repo.UpdateProposalStatusAsync(id, currentStatus, nextStatus.ToString(), ct);
            if (!updated)
            {
                proposal.Status = currentStatus;
                return (false, "INVALID_STATUS", proposal);
            }

            try
            {
                if (nextStatus == ProposalStatus.APROVADO)
                {
                    await _repo.UpdateUnitStatusAsync(proposal.UnidadeId, "SELL", ct);
                    var vendaCriada = await TentarCriarVendaDaPropostaAsync(proposal, currentStatus, ct);
                    if (!vendaCriada)
                    {
                        proposal.Status = currentStatus;
                        return (false, "SALE_FINANCIAL_FAILED", proposal);
                    }
                }
                else if (nextStatus == ProposalStatus.REPROVADO)
                {
                    await _repo.UpdateUnitStatusAsync(proposal.UnidadeId, "OPEN", ct);
                }
            }
            catch
            {
                await _repo.UpdateProposalStatusAsync(id, nextStatus.ToString(), currentStatus, ct);
                proposal.Status = currentStatus;
                return (false, "UNIT_STATUS_UPDATE_FAILED", proposal);
            }

            proposal.Status = nextStatus.ToString();
            return (true, null, proposal);
        }

        private async Task<bool> TentarCriarVendaDaPropostaAsync(Proposal proposal, string previousStatus, CancellationToken ct)
        {
            try
            {
                await CriarVendaDaPropostaAsync(proposal);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar venda da proposta {ProposalId}.", proposal.Id);
                await _repo.UpdateProposalStatusAsync((long)proposal.Id, ProposalStatus.APROVADO.ToString(), previousStatus, ct);
                await _repo.UpdateUnitStatusAsync(proposal.UnidadeId, StatusUnidadeAoReverterAprovacao(previousStatus), ct);
                return false;
            }
        }

        private async Task CriarVendaDaPropostaAsync(Proposal proposal)
        {
            var customerId = await GarantirClienteAsync(proposal);
            var contractNumber = $"PROP-{proposal.Id}";
            var existingSale = await _repo.GetByContractNumberAsync(contractNumber);
            int saleId;

            if (existingSale?.Id > 0)
            {
                saleId = existingSale.Id;
                _logger.LogInformation("Venda existente encontrada para proposta {ProposalId}: sale_id {SaleId}, contract_number {ContractNumber}.", proposal.Id, saleId, contractNumber);
            }
            else
            {
                var sale = MapSaleFromProposal(proposal, customerId);
                saleId = await _vendaCriacaoService.CreateSaleOnlyAsync(sale);
                _logger.LogInformation("Venda criada com sucesso para proposta {ProposalId}: sale_id {SaleId}, contract_number {ContractNumber}.", proposal.Id, saleId, contractNumber);
            }

            await GerarContasReceberDaPropostaAsync(proposal, saleId);
        }

        private async Task<int?> GarantirClienteAsync(Proposal proposal)
        {
            var termos = (proposal.ClienteName ?? string.Empty).Trim();
            var cpf = SomenteDigitos(proposal.CnpjCpf);

            if (!string.IsNullOrWhiteSpace(termos))
            {
                var candidatos = await _clienteRepository.GetByTerms(termos);
                var existente = candidatos
                    .Where(c => c is not null)
                    .FirstOrDefault(c =>
                        (!string.IsNullOrWhiteSpace(c!.CpfCnpj) && SomenteDigitos(c.CpfCnpj) == cpf) ||
                        string.Equals((c!.Name ?? string.Empty).Trim(), termos, StringComparison.OrdinalIgnoreCase));

                if (existente?.Id > 0)
                {
                    return existente.Id;
                }
            }

            var cliente = new Cliente
            {
                Name = string.IsNullOrWhiteSpace(proposal.ClienteName) ? "Cliente da Proposta" : proposal.ClienteName,
                CpfCnpj = ValorOuPadrao(proposal.CnpjCpf, $"PROPOSTA-{proposal.Id}"),
                Email = ValorOuPadrao(proposal.EmailCliente, $"proposta-{proposal.Id}@sem-email.local"),
                Cellphone = ValorOuPadrao(proposal.PhoneOne, string.Empty),
                Cellphone2 = ValorOuPadrao(proposal.PhoneTwo, string.Empty),
                Cep = ValorOuPadrao(proposal.Cep, string.Empty),
                Address = ValorOuPadrao(proposal.Rua, string.Empty),
                AddressNumber = ValorOuPadrao(proposal.Nro, string.Empty),
                Complement = ValorOuPadrao(proposal.Comp, string.Empty),
                Neighborhood = ValorOuPadrao(proposal.Bairro, string.Empty),
                City = ValorOuPadrao(proposal.Cidade, string.Empty),
                State = ValorOuPadrao(proposal.Estado, string.Empty),
                Profession = proposal.Profissao,
                Income = proposal.Renda
            };

            return await _clienteRepository.CreateAsync(cliente);
        }

        private static VendasV2 MapSaleFromProposal(Proposal proposal, int? customerId)
        {
            var parcelasStart = proposal.Condicao
                .OrderBy(c => c.Vencimento)
                .Select(c => (DateTime?)c.Vencimento)
                .FirstOrDefault();

            return new VendasV2
            {
                Status = "COMPLETE",
                UnitValue = proposal.VlrUnidade,
                StartValue = CalcularValorEntrada(proposal),
                ValueToConstructor = proposal.VlrUnidade,
                PercentageToRealtor = 0,
                PercentageToManager = 0,
                ParcelsStart = parcelasStart,
                RealtorComission = 0,
                RealtorComissionRemaining = 0,
                RealtorComissionStatus = "WAITING",
                ManagerComission = 0,
                ManagerComissionRemaining = 0,
                ManagerComissionStatus = "WAITING",
                GenerateNotification = false,
                NetEarnings = proposal.VlrUnidade,
                GrossEarnings = proposal.VlrUnidade,
                BranchId = 1,
                EnterpriseId = checked((int)proposal.EmpreendimentoId),
                UnitId = checked((int)proposal.UnidadeId),
                RealtorId = proposal.CorretorId.HasValue ? checked((int)proposal.CorretorId.Value) : null,
                ManagerId = proposal.GerenteId.HasValue ? checked((int)proposal.GerenteId.Value) : null,
                CoordenatorId = proposal.CoordenadorId.HasValue ? checked((int)proposal.CoordenadorId.Value) : null,
                PaymentTypesId = 1,
                SelledAt = DateTime.Now,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                ValueToRealstate = proposal.VlrUnidade,
                PercentageToRealstate = 0,
                PercentageToFinancial = 0,
                FinancialComission = 0,
                FinancialComissionStatus = "WAITING",
                PercentageToTax = 0,
                TaxComission = 0,
                TaxComissionStatus = "PAID",
                ContractNumber = $"PROP-{proposal.Id}",
                CustomerId = customerId,
                Cliente = proposal.ClienteName,
                EmailCustomer = proposal.EmailCliente,
                PhoneCustomer = proposal.PhoneOne,
                CpfCnpj = proposal.CnpjCpf,
                EnterpriseName = proposal.EnterPriseName,
                UnitName = proposal.UnitName,
                Acts = BuildActs(proposal.Condicao),
                Intermediarias = BuildIntermediarias(proposal.Condicao),
                Parcelas = BuildParcelas(proposal.Condicao)
            };
        }

        private static decimal CalcularValorEntrada(Proposal proposal)
        {
            return proposal.Condicao
                .Where(c => EhEntrada(c.Descricao) || EhAto(c.Descricao))
                .Sum(c => c.ValorTotal > 0 ? c.ValorTotal : c.ValorParcela * c.Qtde);
        }

        private async Task GerarContasReceberDaPropostaAsync(Proposal proposal, int saleId)
        {
            if (await _accountsReceivableService.HasAnyBySaleIdAsync(saleId))
            {
                _logger.LogInformation("Contas a receber ja existem para sale_id {SaleId}; geracao ignorada para proposta {ProposalId}.", saleId, proposal.Id);
                return;
            }

            var gerados = 0;
            foreach (var titulo in BuildContasReceber(proposal, saleId))
            {
                if (titulo.Amount <= 0)
                {
                    _logger.LogWarning("Condicao da proposta {ProposalId} ignorada por valor invalido. SaleId: {SaleId}. Categoria: {Category}. Observacao: {Observations}.", proposal.Id, saleId, titulo.Category, titulo.Observations);
                    continue;
                }

                if (titulo.DueDate == DateTime.Today && titulo.Observations?.Contains("[VENCIMENTO_FALLBACK]") == true)
                {
                    _logger.LogWarning("Conta a receber da proposta {ProposalId} usou vencimento fallback para hoje. SaleId: {SaleId}. Categoria: {Category}.", proposal.Id, saleId, titulo.Category);
                }

                await _accountsReceivableService.CreateAsync(titulo);
                gerados++;
            }

            _logger.LogInformation("Contas a receber geradas com sucesso para proposta {ProposalId}: sale_id {SaleId}, quantidade {Quantidade}.", proposal.Id, saleId, gerados);
        }

        private static IEnumerable<CreateAccountsReceivableRequest> BuildContasReceber(Proposal proposal, int saleId)
        {
            foreach (var condicao in proposal.Condicao ?? Enumerable.Empty<ProposalCondition>())
            {
                var categoria = ClassificarCategoriaRecebivel(condicao.Descricao);
                var quantidade = QuantidadeTitulosRecebiveis(condicao);
                var valorParcela = CalcularValorParcelaRecebivel(condicao, quantidade);
                var usouVencimentoFallback = condicao.Vencimento == default;
                var vencimentoBase = usouVencimentoFallback ? DateTime.Today : condicao.Vencimento.Date;

                for (var index = 0; index < quantidade; index++)
                {
                    var vencimento = CalcularVencimentoRecebivel(condicao.Descricao, vencimentoBase, index);
                    var descricao = quantidade > 1
                        ? $"{categoria} {index + 1}/{quantidade} - Venda {saleId}"
                        : $"{categoria} - Venda {saleId}";

                    yield return new CreateAccountsReceivableRequest
                    {
                        SaleId = saleId,
                        BranchId = 1,
                        CompetenceDate = DateTime.Today,
                        DueDate = vencimento,
                        PaidDate = null,
                        Description = descricao,
                        Status = "WAITING",
                        Category = categoria,
                        Amount = valorParcela,
                        PendingAmount = valorParcela,
                        Observations = usouVencimentoFallback
                            ? $"{condicao.Descricao} [VENCIMENTO_FALLBACK]"
                            : condicao.Descricao
                    };
                }
            }
        }

        private static int QuantidadeTitulosRecebiveis(ProposalCondition condicao)
        {
            if (EhMensal(condicao.Descricao) || EhAnual(condicao.Descricao))
            {
                return Math.Max(condicao.Qtde, 1);
            }

            return 1;
        }

        private static decimal CalcularValorParcelaRecebivel(ProposalCondition condicao, int quantidade)
        {
            if (EhMensal(condicao.Descricao) || EhAnual(condicao.Descricao))
            {
                if (condicao.ValorParcela > 0)
                {
                    return condicao.ValorParcela;
                }

                return quantidade > 0 ? condicao.ValorTotal / quantidade : condicao.ValorTotal;
            }

            if (condicao.ValorTotal > 0)
            {
                return condicao.ValorTotal;
            }

            return condicao.ValorParcela * Math.Max(condicao.Qtde, 1);
        }

        private static DateTime CalcularVencimentoRecebivel(string? descricao, DateTime vencimentoBase, int index)
        {
            if (EhAnual(descricao))
            {
                return vencimentoBase.AddYears(index);
            }

            if (EhMensal(descricao))
            {
                return vencimentoBase.AddMonths(index);
            }

            return vencimentoBase;
        }

        private static string ClassificarCategoriaRecebivel(string? descricao)
        {
            var normalized = NormalizarDescricaoCondicao(descricao);

            return normalized switch
            {
                "ATOJM" or "ATO" or "ATOCOMISSAO" or "ATOCONST" or "ATOCONSTRUTORA" => "Ato",
                "MENSAL" => "Mensal",
                "ANUALJM" or "ANUAL" or "ANUALCONST" or "ANUALCONSTRUTORA" => "Anual",
                "COMISSAO" => "Comissão",
                "FGTS" => "FGTS",
                "ENTREGADECHAVES" => "Entrega de chaves",
                "POSOBRAS" => "Pós obras",
                "FINANCIAMENTO" => "Financiamento",
                "PROMOCAO" => "Promoção",
                "REPASSECONSTRUTORA" => "Repasse Construtora",
                _ => string.IsNullOrWhiteSpace(descricao) ? "Outros" : descricao.Trim()
            };
        }

        private static List<Acts?>? BuildActs(IEnumerable<ProposalCondition> condicoes)
        {
            var result = new List<Acts?>();
            var sequence = 1;

            foreach (var condicao in condicoes.Where(c => EhAto(c.Descricao)))
            {
                foreach (var parcela in ExpandCondition(condicao))
                {
                    result.Add(new Acts
                    {
                        Parcel = sequence++,
                        Value = parcela.Valor,
                        Date = parcela.DueDate,
                        Observations = condicao.Descricao,
                        Status = "WAITING"
                    });
                }
            }

            return result.Count > 0 ? result : null;
        }

        private static List<Installaments?>? BuildIntermediarias(IEnumerable<ProposalCondition> condicoes)
        {
            var result = new List<Installaments?>();
            var sequence = 1;

            foreach (var condicao in condicoes.Where(c => EhIntermediaria(c.Descricao)))
            {
                foreach (var parcela in ExpandCondition(condicao))
                {
                    result.Add(new Installaments
                    {
                        Id = sequence++,
                        VlrInstallament = parcela.Valor,
                        DueDate = parcela.DueDate.ToString("yyyy-MM-dd"),
                        Obs = condicao.Descricao,
                        Status = "WAITING"
                    });
                }
            }

            return result.Count > 0 ? result : null;
        }

        private static List<Installaments?>? BuildParcelas(IEnumerable<ProposalCondition> condicoes)
        {
            var result = new List<Installaments?>();
            var sequence = 1;

            foreach (var condicao in condicoes.Where(c => !EhAto(c.Descricao) && !EhIntermediaria(c.Descricao)))
            {
                foreach (var parcela in ExpandCondition(condicao))
                {
                    result.Add(new Installaments
                    {
                        Id = sequence++,
                        VlrInstallament = parcela.Valor,
                        DueDate = parcela.DueDate.ToString("yyyy-MM-dd"),
                        Obs = condicao.Descricao,
                        Status = "WAITING"
                    });
                }
            }

            return result.Count > 0 ? result : null;
        }

        private static IEnumerable<(DateTime DueDate, decimal Valor)> ExpandCondition(ProposalCondition condicao)
        {
            var quantidade = Math.Max(condicao.Qtde, 1);
            for (var index = 0; index < quantidade; index++)
            {
                yield return (CalcularVencimento(condicao, index), condicao.ValorParcela);
            }
        }

        private static DateTime CalcularVencimento(ProposalCondition condicao, int index)
        {
            var descricao = (condicao.Descricao ?? string.Empty).Trim().ToUpperInvariant();
            return descricao switch
            {
                "ANUAL" => condicao.Vencimento.AddYears(index),
                _ => condicao.Vencimento.AddMonths(index)
            };
        }

        private async Task ValidateApprovalParametersAsync(
            Proposal proposal,
            IReadOnlyCollection<ProposalCondition> conds,
            CancellationToken ct)
        {
            var parameters = await _repo.GetEnterpriseApprovalParamsAsync(proposal.EmpreendimentoId, ct);
            if (parameters is null)
            {
                return;
            }

            var errors = new List<string>();

            if (parameters.ApprovalAct.HasValue && parameters.ApprovalAct.Value > 0)
            {
                var totalAto = conds
                    .Where(c => EhAtoValidacaoComercial(c.Descricao))
                    .Sum(ValorTotalCondicao);

                if (totalAto < parameters.ApprovalAct.Value)
                {
                    errors.Add($"Ato informado menor que o minimo configurado para o empreendimento. Minimo: {FormatCurrency(parameters.ApprovalAct.Value)}. Informado: {FormatCurrency(totalAto)}.");
                }
            }

            if (parameters.ApprovalInstallments.HasValue && parameters.ApprovalInstallments.Value > 0)
            {
                var totalParcelas = conds
                    .Where(c => EhParcelaMensalValidacaoComercial(c.Descricao))
                    .Sum(c => Math.Max(c.Qtde, 0));

                if (totalParcelas > parameters.ApprovalInstallments.Value)
                {
                    errors.Add($"Quantidade de parcelas maior que o permitido para o empreendimento. Maximo: {parameters.ApprovalInstallments.Value}. Informado: {totalParcelas}.");
                }
            }

            if (parameters.ApprovalIntermediate.HasValue && parameters.ApprovalIntermediate.Value > 0)
            {
                var totalIntermediaria = conds
                    .Where(c => EhIntermediariaValidacaoComercial(c.Descricao))
                    .Sum(ValorTotalCondicao);

                if (totalIntermediaria < parameters.ApprovalIntermediate.Value)
                {
                    errors.Add($"Intermediaria informada menor que o minimo configurado para o empreendimento. Minimo: {FormatCurrency(parameters.ApprovalIntermediate.Value)}. Informado: {FormatCurrency(totalIntermediaria)}.");
                }
            }

            if (errors.Count > 0)
            {
                throw new ArgumentException(string.Join(" ", errors));
            }
        }

        private static decimal ValorTotalCondicao(ProposalCondition condicao)
        {
            if (condicao.ValorTotal > 0)
            {
                return condicao.ValorTotal;
            }

            return condicao.ValorParcela * Math.Max(condicao.Qtde, 1);
        }

        private void AplicarResumoComissao(Proposal proposal, List<ProposalCondition> conds)
        {
            proposal.Condicao = conds;
            var result = _commissionCalculator.CalculateAtoParcelas(proposal.VlrUnidade, proposal.Condicao);

            proposal.CommissionMode = CommissionModeAtoParcelas;
            proposal.CommissionPercentage = result.CommissionPercentage;
            proposal.CommissionTotal = result.CommissionTotal;
            proposal.CommissionTotalToRealestate = result.TotalRealEstate;
            proposal.CommissionTotalToConstructor = result.TotalConstructor;
            proposal.CommissionBalance = result.CommissionBalanceFinal;
            proposal.CommissionCalculatedAt = DateTime.UtcNow;
            proposal.CommissionCalculationVersion = CommissionCalculationVersion;
        }

        private static string FormatCurrency(decimal value)
            => value.ToString("C", CultureInfo.GetCultureInfo("pt-BR"));

        private static bool EhAtoValidacaoComercial(string? descricao)
        {
            var normalized = NormalizarDescricaoCondicao(descricao);
            return normalized == "ATO" ||
                   normalized == "ATOCOMISSAO" ||
                   normalized == "ATOJM" ||
                   normalized == "ATOCONST" ||
                   normalized == "ATOCONSTRUTORA";
        }

        private static bool EhIntermediariaValidacaoComercial(string? descricao)
        {
            var normalized = NormalizarDescricaoCondicao(descricao);
            return normalized == "INTERMEDIARIA" ||
                   normalized == "ENTRADA" ||
                   normalized == "SINAL" ||
                   normalized == "ANUALJM" ||
                   normalized == "ANUALCONST" ||
                   normalized == "ANUALCONSTRUTORA";
        }

        private static bool EhParcelaMensalValidacaoComercial(string? descricao)
            => NormalizarDescricaoCondicao(descricao) == "MENSAL";

        private static bool EhMensal(string? descricao)
            => NormalizarDescricaoCondicao(descricao) == "MENSAL";

        private static bool EhAnual(string? descricao)
        {
            var normalized = NormalizarDescricaoCondicao(descricao);
            return normalized == "ANUAL" ||
                   normalized == "ANUALJM" ||
                   normalized == "ANUALCONST" ||
                   normalized == "ANUALCONSTRUTORA";
        }

        private static bool EhAto(string? descricao)
            => NormalizarDescricaoCondicao(descricao) == "ATO";

        private static bool EhEntrada(string? descricao)
            => NormalizarDescricaoCondicao(descricao) == "ENTRADA";

        private static bool EhSinal(string? descricao)
            => NormalizarDescricaoCondicao(descricao) == "SINAL";

        private static bool EhIntermediaria(string? descricao)
        {
            var normalized = NormalizarDescricaoCondicao(descricao);
            return normalized == "INTERMEDIARIA" ||
                   normalized == "ENTRADA" ||
                   normalized == "SINAL";
        }

        private static string NormalizarDescricaoCondicao(string? descricao)
        {
            var normalized = (descricao ?? string.Empty)
                .Trim()
                .ToUpperInvariant()
                .Replace(" ", string.Empty)
                .Replace("-", string.Empty)
                .Replace("_", string.Empty);

            return RemoverAcentosStatus(normalized);
        }

        private static string SomenteDigitos(string? valor)
            => new string((valor ?? string.Empty).Where(char.IsDigit).ToArray());

        private static string ValorOuPadrao(string? valor, string padrao)
            => string.IsNullOrWhiteSpace(valor) ? padrao : valor;

        private static Proposal MapProposal(PropostaReservaDto dto)
        {
            static DateTime? ParseDate(string? s)
                => string.IsNullOrWhiteSpace(s) ? null : DateTime.Parse(s);

            return new Proposal
            {
                EmpreendimentoId = long.Parse(dto.EmpreendimentoID),
                UnidadeId = long.Parse(dto.UnidadeID),
                VlrUnidade = dto.VlrUnidade,
                EngCaixa = dto.EngCaixa,
                ClienteName = dto.ClienteName,
                DateNascimento = ParseDate(dto.DateNascimento),
                CnpjCpf = dto.CnpjCPF,
                Rg = dto.Rg,
                EmailCliente = dto.EmailCliente,
                PhoneOne = dto.Phoneone,
                PhoneTwo = dto.Phonetwo,
                EstadoCivil = dto.Estadocivil,
                Profissao = dto.Profissao,
                Renda = dto.Renda,
                ClienteNameSecondary = dto.ClienteNameSecondary,
                DataNascimentoSecondary = ParseDate(dto.DataNascimentoSecondary),
                CnpjCpfSecondary = dto.CnpjCPFSecondary,
                RgSecondary = dto.RgSecondary,
                EmailClienteSecondary = dto.EmailClienteSecondary,
                PhoneOneSecondary = dto.PhoneoneSecondary,
                PhoneTwoSecondary = dto.PhonetwoSecondary,
                EstadoCivilSecondary = dto.EstadocivilSecondary,
                ProfissaoSecondary = dto.ProfissaoSecondary,
                RendaSecondary = dto.RendaSecondary,
                Cep = dto.Cep,
                Rua = dto.Rua,
                Nro = dto.Nro,
                Comp = dto.Comp,
                Bairro = dto.Bairro,
                Cidade = dto.Cidade,
                Estado = dto.Estado,
                CorretorId = long.TryParse(dto.CorretorID, out var corretorId) ? corretorId : null,
                GerenteId = long.TryParse(dto.GerenteID, out var gerenteId) ? gerenteId : null,
                CoordenadorId = long.TryParse(dto.CoordenadorID, out var coordenadorId) ? coordenadorId : null,
                Status = NormalizeStatus(dto.Status)
            };
        }

        private static IEnumerable<ProposalCondition> MapConditions(PropostaReservaDto dto)
        {
            return (dto.Condicao ?? new())
                .Select(c => new ProposalCondition
                {
                    Qtde = c.Qtde,
                    Descricao = c.Descricao,
                    Vencimento = DateTime.Parse(c.Vencimento),
                    ValorParcela = c.ValorParcela,
                    ValorTotal = c.ValorTotal
                })
                .ToList();
        }

        private static string NormalizeFilterStatus(string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return null!;
            }

            return NormalizeStatus(status);
        }

        private static string NormalizeStatus(string? status)
        {
            var normalized = (status ?? string.Empty)
                .Trim()
                .ToUpperInvariant()
                .Replace(" ", "_")
                .Replace("-", "_");

            normalized = RemoverAcentosStatus(normalized);

            return normalized switch
            {
                "" => ProposalStatus.RASCUNHO.ToString(),
                "OPEN" => ProposalStatus.RASCUNHO.ToString(),
                "RESERVED" => ProposalStatus.RASCUNHO.ToString(),
                "EM_ANALISE" => ProposalStatus.EM_ANALISE.ToString(),
                "IN_ANALYSIS" => ProposalStatus.EM_ANALISE.ToString(),
                "IN_ANALISE" => ProposalStatus.EM_ANALISE.ToString(),
                "APPROVED" => ProposalStatus.APROVADO.ToString(),
                "REJECTED" => ProposalStatus.REPROVADO.ToString(),
                "CANCELLED" => ProposalStatus.CANCELADO.ToString(),
                _ => normalized
            };
        }

        private async Task TryMarkPostVisitAsInProposalAsync(int? leadId, long proposalId)
        {
            if (!leadId.HasValue || leadId.Value <= 0)
            {
                return;
            }

            try
            {
                await _leadPostVisitService.MarkAsInProposalAsync(leadId.Value, proposalId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Proposta {ProposalId} criada, mas nao foi possivel marcar pos-visita do lead {LeadId} como EM_PROPOSTA.", proposalId, leadId.Value);
            }
        }

        private static string NormalizeUnitStatus(string? status)
        {
            var normalized = (status ?? string.Empty)
                .Trim()
                .ToUpperInvariant();

            return normalized switch
            {
                "SOLD" => "SELL",
                "VENDIDA" => "SELL",
                "RESERVADA" => "RESERVED",
                "DISPONIVEL" => "OPEN",
                "AVAILABLE" => "OPEN",
                _ => normalized
            };
        }

        private static string StatusUnidadeAoReverterAprovacao(string previousStatus)
        {
            return string.Equals(previousStatus, ProposalStatus.EM_ANALISE.ToString(), StringComparison.Ordinal)
                ? "RESERVED"
                : "OPEN";
        }

        private static string RemoverAcentosStatus(string status)
        {
            return status
                .Replace("Á", "A")
                .Replace("À", "A")
                .Replace("Â", "A")
                .Replace("Ã", "A")
                .Replace("É", "E")
                .Replace("Ê", "E")
                .Replace("Í", "I")
                .Replace("Ó", "O")
                .Replace("Ô", "O")
                .Replace("Õ", "O")
                .Replace("Ú", "U")
                .Replace("Ç", "C");
        }
    }
}


