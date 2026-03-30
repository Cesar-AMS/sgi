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
            static DateTime? ParseDate(string? s)
                => string.IsNullOrWhiteSpace(s) ? null : DateTime.Parse(s);

            var p = new Proposal
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

                CorretorId = long.TryParse(dto.CorretorID, out var cid) ? cid : null,
                GerenteId = long.TryParse(dto.GerenteID, out var gid) ? gid : null,

                Status = string.IsNullOrWhiteSpace(dto.Status) ? "OPEN" : dto.Status!.ToUpperInvariant()
            };

            // mapear condições
            var conds = (dto.Condicao ?? new())
                .Select(c => new ProposalCondition
                {
                    Qtde = c.Qtde,
                    Descricao = c.Descricao,
                    Vencimento = DateTime.Parse(c.Vencimento), // yyyy-MM-dd
                    ValorParcela = c.ValorParcela,
                    ValorTotal = c.ValorTotal // já calculado no front; se quiser, recalcule: Qtde*ValorParcela
                });

            var x = (long)await _repo.CreateAsync(p, conds, ct);

            return x;


        }

        public Task<Proposal?> GetByIdAsync(long id, CancellationToken ct)
            => _repo.GetByIdAsync(id, ct);

        public Task<IEnumerable<Proposal>> ListAsync(DateTime? de, DateTime? ate, string? status, int? user, int? gerente, int? corretor, CancellationToken ct)
            => _repo.ListAsync(de, ate, status, user, gerente, corretor, ct);
    }
}
