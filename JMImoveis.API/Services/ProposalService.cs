using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class ProposalService : IProposalService
    {
        private readonly IVendaRepository _repo;
        private readonly IClienteRepository _clienteRepository;
        private readonly IVendaCriacaoService _vendaCriacaoService;

        public ProposalService(
            IVendaRepository repo,
            IClienteRepository clienteRepository,
            IVendaCriacaoService vendaCriacaoService)
        {
            _repo = repo;
            _clienteRepository = clienteRepository;
            _vendaCriacaoService = vendaCriacaoService;
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
            var conds = MapConditions(dto);
            return await _repo.CreateAsync(proposal, conds, ct);
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

            var conds = MapConditions(dto);
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

        public Task<(bool Success, string? Error, Proposal? Proposal)> EnviarParaAnaliseAsync(long id, CancellationToken ct)
            => TransitionAsync(id, ProposalStatus.RASCUNHO, ProposalStatus.EM_ANALISE, ct);

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
                    await TentarCriarVendaDaPropostaAsync(proposal);
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

        private async Task TentarCriarVendaDaPropostaAsync(Proposal proposal)
        {
            try
            {
                await CriarVendaDaPropostaAsync(proposal);
            }
            catch
            {
                // Aprovacao da proposta e venda da unidade nao devem ser bloqueadas
                // por falha na integracao posterior de venda/financeiro.
            }
        }

        private async Task CriarVendaDaPropostaAsync(Proposal proposal)
        {
            var customerId = await GarantirClienteAsync(proposal);
            var sale = MapSaleFromProposal(proposal, customerId);
            await _vendaCriacaoService.CreateAsync(sale);
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
                CpfCnpj = proposal.CnpjCpf,
                Email = proposal.EmailCliente,
                Cellphone = proposal.PhoneOne,
                Cellphone2 = proposal.PhoneTwo,
                Cep = proposal.Cep,
                Address = proposal.Rua,
                AddressNumber = proposal.Nro,
                Complement = proposal.Comp,
                Neighborhood = proposal.Bairro,
                City = proposal.Cidade,
                State = proposal.Estado,
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
                Status = "RESERVED",
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

            foreach (var condicao in condicoes.Where(c => EhEntrada(c.Descricao) || EhSinal(c.Descricao)))
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

            foreach (var condicao in condicoes.Where(c => !EhAto(c.Descricao) && !EhEntrada(c.Descricao) && !EhSinal(c.Descricao)))
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

        private static bool EhAto(string? descricao)
            => string.Equals((descricao ?? string.Empty).Trim(), "Ato", StringComparison.OrdinalIgnoreCase);

        private static bool EhEntrada(string? descricao)
            => string.Equals((descricao ?? string.Empty).Trim(), "Entrada", StringComparison.OrdinalIgnoreCase);

        private static bool EhSinal(string? descricao)
            => string.Equals((descricao ?? string.Empty).Trim(), "Sinal", StringComparison.OrdinalIgnoreCase);

        private static string SomenteDigitos(string? valor)
            => new string((valor ?? string.Empty).Where(char.IsDigit).ToArray());

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


