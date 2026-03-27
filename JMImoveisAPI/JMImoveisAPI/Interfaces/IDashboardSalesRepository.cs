using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IDashboardSalesRepository
    {
        Task<IReadOnlyList<SalesByMonthDto>> GetByMonthAsync(DateTime yearStart, DateTime yearEnd, CancellationToken ct);
        Task<IReadOnlyList<SalesByEntityDto>> GetByRealtorAsync(DateTime monthStart, DateTime monthEnd, CancellationToken ct);
        Task<IReadOnlyList<SalesByEntityDto>> GetByManagerAsync(DateTime monthStart, DateTime monthEnd, CancellationToken ct);
        Task<IReadOnlyList<SalesByEntityDto>> GetByCoordenatorAsync(DateTime monthStart, DateTime monthEnd, CancellationToken ct);
        Task<IReadOnlyList<SalesByEntityDto>> GetByBranchAsync(DateTime monthStart, DateTime monthEnd, CancellationToken ct);

    }
}
