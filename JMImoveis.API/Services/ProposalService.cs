using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class ProposalService : IProposalService
    {
        private readonly IVendaRepository _repo;

        public ProposalService(IVendaRepository repo) => _repo = repo;

        public async Task<long> CreateAsync(PropostaReservaDto dto, CancellationToken ct)
        {
            var proposal = MapProposal(dto);
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

        public async Task<IEnumerable<Proposal>> ListAsync(DateTime? de, DateTime? ate, string? status, int? user, int? gerente, int? corretor, CancellationToken ct)
        {
            var proposals = await _repo.ListAsync(de, ate, NormalizeFilterStatus(status), user, gerente, corretor, ct);
            foreach (var proposal in proposals)
            {
                proposal.Status = NormalizeStatus(proposal.Status);
            }

            return proposals;
        }

        public Task<(bool Success, string? Error, Proposal? Proposal)> EnviarParaAnaliseAsync(long id, CancellationToken ct)
            => TransitionAsync(id, ProposalStatus.RASCUNHO, ProposalStatus.EM_ANALISE, ct);

        public Task<(bool Success, string? Error, Proposal? Proposal)> AprovarAsync(long id, CancellationToken ct)
            => TransitionAsync(id, ProposalStatus.EM_ANALISE, ProposalStatus.APROVADO, ct);

        public Task<(bool Success, string? Error, Proposal? Proposal)> ReprovarAsync(long id, CancellationToken ct)
            => TransitionAsync(id, ProposalStatus.EM_ANALISE, ProposalStatus.REPROVADO, ct);

        private async Task<(bool Success, string? Error, Proposal? Proposal)> TransitionAsync(long id, ProposalStatus expectedStatus, ProposalStatus nextStatus, CancellationToken ct)
        {
            var proposal = await _repo.GetByIdAsync(id, ct);
            if (proposal is null)
            {
                return (false, "NOT_FOUND", null);
            }

            var currentStatus = NormalizeStatus(proposal.Status);
            if (!string.Equals(currentStatus, expectedStatus.ToString(), StringComparison.Ordinal))
            {
                proposal.Status = currentStatus;
                return (false, "INVALID_STATUS", proposal);
            }

            var updated = await _repo.UpdateProposalStatusAsync(id, expectedStatus.ToString(), nextStatus.ToString(), ct);
            if (!updated)
            {
                proposal.Status = currentStatus;
                return (false, "INVALID_STATUS", proposal);
            }

            if (nextStatus == ProposalStatus.APROVADO)
            {
                await _repo.UpdateUnitStatusAsync(proposal.UnidadeId, "RESERVED", ct);
            }
            else if (nextStatus == ProposalStatus.REPROVADO)
            {
                await _repo.UpdateUnitStatusAsync(proposal.UnidadeId, "OPEN", ct);
            }

            proposal.Status = nextStatus.ToString();
            return (true, null, proposal);
        }

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
            var normalized = (status ?? string.Empty).Trim().ToUpperInvariant();
            return normalized switch
            {
                "" => ProposalStatus.RASCUNHO.ToString(),
                "OPEN" => ProposalStatus.RASCUNHO.ToString(),
                "RESERVED" => ProposalStatus.RASCUNHO.ToString(),
                "IN_ANALYSIS" => ProposalStatus.EM_ANALISE.ToString(),
                "IN_ANALISE" => ProposalStatus.EM_ANALISE.ToString(),
                "APPROVED" => ProposalStatus.APROVADO.ToString(),
                "REJECTED" => ProposalStatus.REPROVADO.ToString(),
                "CANCELLED" => ProposalStatus.CANCELADO.ToString(),
                _ => normalized
            };
        }
    }
}


