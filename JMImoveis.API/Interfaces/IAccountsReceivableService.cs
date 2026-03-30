using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IAccountsReceivableService
    {
        Task<PagedResult<AccountsReceivableRowDto>> GetPagedAsync(
            DateTime? dueFrom,
            DateTime? dueTo,
            int? branchId,
            string? category,
            string? status,
            string? search,
            int page,
            int pageSize);
        Task<AccountsReceivableSummaryDto> GetSummaryAsync(
            DateTime? dueFrom,
            DateTime? dueTo,
            int? branchId,
            string? category,
            string? status,
            string? search);
        Task<int> CreateAsync(CreateAccountsReceivableRequest req);
        Task SettleAsync(int id, SettleAccountsReceivableRequest req);
    }
}
