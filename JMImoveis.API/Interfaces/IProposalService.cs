using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IProposalService
    {
        Task<long> CreateAsync(PropostaReservaDto dto, CancellationToken ct);
        Task<Proposal?> GetByIdAsync(long id, CancellationToken ct);
        Task<IEnumerable<Proposal>> ListAsync(DateTime? de, DateTime? ate, string? status, int? user, int? gerente, int? corretor, CancellationToken ct);

    }
}
