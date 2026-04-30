using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IProposalService
    {
        Task<long> CreateAsync(PropostaReservaDto dto, CancellationToken ct);
        Task<bool> UpdateAsync(long id, PropostaReservaDto dto, CancellationToken ct);
        Task<Proposal?> GetByIdAsync(long id, CancellationToken ct);
        Task<IEnumerable<Proposal>> ListAsync(DateTime? de, DateTime? ate, string? status, int? user, int? gerente, int? coordenador, int? corretor, int? construtora, int? empreendimento, CancellationToken ct);
        Task<(bool Success, string? Error, Proposal? Proposal)> EnviarParaAnaliseAsync(long id, CancellationToken ct);
        Task<(bool Success, string? Error, Proposal? Proposal)> AprovarAsync(long id, CancellationToken ct);
        Task<(bool Success, string? Error, Proposal? Proposal)> ReprovarAsync(long id, CancellationToken ct);
    }
}
