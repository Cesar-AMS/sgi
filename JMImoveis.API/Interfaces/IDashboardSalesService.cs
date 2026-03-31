using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IDashboardSalesService
    {
        Task<IReadOnlyList<SalesByMonthDto>> GetByMonthAsync(int year, CancellationToken ct);
        Task<IReadOnlyList<SalesByEntityDto>> GetByRealtorAsync(int year, int month, CancellationToken ct);
        Task<IReadOnlyList<SalesByEntityDto>> GetByManagerAsync(int year, int month, CancellationToken ct);
        Task<IReadOnlyList<SalesByEntityDto>> GetByCoordenatorAsync(int year, int month, CancellationToken ct);
        Task<IReadOnlyList<SalesByEntityDto>> GetByBranchAsync(int year, int month, CancellationToken ct);
    }
}
