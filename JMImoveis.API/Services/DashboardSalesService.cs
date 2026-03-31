using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class DashboardSalesService : IDashboardSalesService
    {
        private readonly IDashboardSalesRepository _dashboardSalesRepository;

        public DashboardSalesService(IDashboardSalesRepository dashboardSalesRepository)
        {
            _dashboardSalesRepository = dashboardSalesRepository;
        }

        public Task<IReadOnlyList<SalesByMonthDto>> GetByMonthAsync(int year, CancellationToken ct)
        {
            if (year <= 0) year = DateTime.UtcNow.Year;
            var start = new DateTime(year, 1, 1);
            var end = start.AddYears(1);
            return _dashboardSalesRepository.GetByMonthAsync(start, end, ct);
        }

        public Task<IReadOnlyList<SalesByEntityDto>> GetByRealtorAsync(int year, int month, CancellationToken ct)
        {
            var (start, end) = MonthRange(year, month);
            return _dashboardSalesRepository.GetByRealtorAsync(start, end, ct);
        }

        public Task<IReadOnlyList<SalesByEntityDto>> GetByManagerAsync(int year, int month, CancellationToken ct)
        {
            var (start, end) = MonthRange(year, month);
            return _dashboardSalesRepository.GetByManagerAsync(start, end, ct);
        }

        public Task<IReadOnlyList<SalesByEntityDto>> GetByCoordenatorAsync(int year, int month, CancellationToken ct)
        {
            var (start, end) = MonthRange(year, month);
            return _dashboardSalesRepository.GetByCoordenatorAsync(start, end, ct);
        }

        public Task<IReadOnlyList<SalesByEntityDto>> GetByBranchAsync(int year, int month, CancellationToken ct)
        {
            var (start, end) = MonthRange(year, month);
            return _dashboardSalesRepository.GetByBranchAsync(start, end, ct);
        }

        private static (DateTime start, DateTime end) MonthRange(int year, int month)
        {
            if (year <= 0) year = DateTime.UtcNow.Year;
            if (month < 1 || month > 12) month = DateTime.UtcNow.Month;
            var start = new DateTime(year, month, 1);
            return (start, start.AddMonths(1));
        }
    }
}
