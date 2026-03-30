using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class VendaConsultaService : IVendaConsultaService
    {
        private readonly IVendaRepository _vendaRepository;

        public VendaConsultaService(IVendaRepository vendaRepository)
        {
            _vendaRepository = vendaRepository;
        }

        public async Task<IEnumerable<VendasV2>> GetAllAsync()
        {
            return await _vendaRepository.GetAllAsync();
        }

        public async Task<IEnumerable<VendasV2>> GetAllFiltersAsync(SalesFilters filters)
        {
            return await _vendaRepository.GetAllByDateAsync(filters.StartAt,
                                                            filters.FinishAt,
                                                            filters.EnterpriseId,
                                                            filters.FilialId,
                                                            filters.ClienteId,
                                                            filters.Status ?? "ABC",
                                                            filters.ManagementId);
        }

        public async Task<VendasV2?> GetByIdAsync(int id)
        {
            return await _vendaRepository.GetByIdAsync(id);
        }

        public async Task<VendasV2?> GetFullAsync(int saleId)
        {
            var map = new FinanceMappingOptions(
                SeriesIdReceivables: 1,
                SeriesIdPayables: 1,
                CategoryActs: 1,
                CategoryInstallments: 1,
                CategoryRealtor: 1,
                CategoryManager: 19,
                CategoryFinancial: 19,
                AccountReceivables: 16,
                AccountPayables: 16,
                CostCenterActs: 1
            );

            return await _vendaRepository.GetSaleFullAsync(saleId, map);
        }

        public async Task<List<int>> GetCustomerIdsBySaleIdAsync(int id)
        {
            return await _vendaRepository.GetCustomerIdsBySaleIdAsync(id);
        }

        public async Task<List<ParcelDto>> GetParcelsBySaleIdAsync(int id)
        {
            return await _vendaRepository.GetParcelsBySaleIdAsync(id);
        }

        public async Task<(bool IsValid, CorretorDashboardResponse? Result)> GetDashboardCorretorAsync(
            int? year,
            int? month,
            int? managerId,
            CancellationToken ct)
        {
            var tz = TryGetTz("America/Sao_Paulo") ?? TimeZoneInfo.Local;
            var now = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, tz).DateTime;
            var resolvedYear = year ?? now.Year;
            var resolvedMonth = month ?? now.Month;

            if (resolvedYear < 2000 || resolvedYear > 2100 || resolvedMonth < 1 || resolvedMonth > 12)
            {
                return (false, null);
            }

            var result = await _vendaRepository.GetDashboardCorretorAsync(resolvedYear, resolvedMonth, managerId, ct);
            return (true, result);
        }

        public async Task<(bool IsValid, DashboardResponse? Result)> GetDashboardAsync(int year, int month, CancellationToken ct)
        {
            if (year < 2000 || month < 1 || month > 12)
            {
                return (false, null);
            }

            var result = await _vendaRepository.GetDashboardAsync(year, month, ct);
            return (true, result);
        }

        private static TimeZoneInfo? TryGetTz(string id)
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(id);
            }
            catch
            {
                return null;
            }
        }
    }
}
