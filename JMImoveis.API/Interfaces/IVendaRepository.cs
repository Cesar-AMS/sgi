using JMImoveisAPI.Entities;
using System.Globalization;

namespace JMImoveisAPI.Interfaces
{
    public interface IVendaRepository
    {
        Task<CorretorDashboardResponse> GetDashboardCorretorAsync(int year, int month, int? managerId, CancellationToken ct = default);
        Task<DashboardResponse> GetDashboardAsync(int year, int month, CancellationToken ct = default);
        Task<IEnumerable<VendasV2>> GetAllByDateAsync(string? startAt = null, string? finishAt = null, int enterpriseId = 0, int filialId = 0, int clienteId = 0, string status = "ABC", int managerId = 0);
        Task<IEnumerable<VendasV2>> GetAllAsync();
        Task<VendasV2?> GetByIdAsync(int id);
        Task<int> CreateAsync(VendasV2 entity);
        Task<bool> UpdateAsync(VendasV2 entity);
        Task<bool> DeleteAsync(int id);

        Task<VendasV2?> GetSaleFullAsync(int saleId, FinanceMappingOptions map);

        // Propostas
        Task<long> CreateAsync(Proposal proposal, IEnumerable<ProposalCondition> conds, CancellationToken ct);
        Task<bool> UpdateProposalAsync(Proposal proposal, IEnumerable<ProposalCondition> conds, CancellationToken ct);
        Task<Proposal?> GetByIdAsync(long id, CancellationToken ct);
        Task<IEnumerable<Proposal>> ListAsync(DateTime? de, DateTime? ate, string? status, int? user, int? gerente, int? corretor, CancellationToken ct);
        Task<bool> UpdateProposalStatusAsync(long id, string expectedStatus, string nextStatus, CancellationToken ct);
        Task<bool> UpdateUnitStatusAsync(long unitId, string nextStatus, CancellationToken ct);

        Task<List<int>> GetCustomerIdsBySaleIdAsync(int saleId);
        Task<List<ParcelDto>> GetParcelsBySaleIdAsync(int saleId);
    }
}


