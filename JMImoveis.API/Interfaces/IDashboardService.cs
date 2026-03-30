using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardResponse> GetDashboardAsync(int year, int month, CancellationToken ct = default);
    }
}
