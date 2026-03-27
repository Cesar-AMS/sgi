using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IReportsRepository
    {
        Task<IEnumerable<MonthlyBranchSalesReportV3>> GetMonthlyBranchSalesAsync(int? year = null);

        Task<IEnumerable<UserMonthlyPayablesSummaryV3>> GetUserMonthlyPayablesSummaryAsync(int year);

        Task<IEnumerable<UserCategoryMonthlyPayablesSummaryV3>> GetUserCategoryMonthlyPayablesAsync(int year);

        Task<IEnumerable<UserPayableDetailV3>> GetUserPayablesDetailsAsync(long userId, int? year = null);
    }
}
