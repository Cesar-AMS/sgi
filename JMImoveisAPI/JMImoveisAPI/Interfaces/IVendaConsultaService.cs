using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IVendaConsultaService
    {
        Task<IEnumerable<VendasV2>> GetAllAsync();
        Task<IEnumerable<VendasV2>> GetAllFiltersAsync(SalesFilters filters);
        Task<VendasV2?> GetByIdAsync(int id);
        Task<VendasV2?> GetFullAsync(int saleId);
        Task<List<int>> GetCustomerIdsBySaleIdAsync(int id);
        Task<List<ParcelDto>> GetParcelsBySaleIdAsync(int id);
        Task<(bool IsValid, CorretorDashboardResponse? Result)> GetDashboardCorretorAsync(int? year, int? month, int? managerId, CancellationToken ct);
        Task<(bool IsValid, DashboardResponse? Result)> GetDashboardAsync(int year, int month, CancellationToken ct);
    }
}
