using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IAccountsReceivableRepository
    {
        Task<PagedResult<AccountsReceivableRowDto>> GetPagedAsync(AccountsReceivableQuery q, int page, int pageSize);
        Task<AccountsReceivableSummaryDto> GetSummaryAsync(AccountsReceivableQuery q);
        Task<int> CreateAsync(CreateAccountsReceivableRequest req);

        Task SettleAsync(int id, SettleAccountsReceivableRequest req);
    }
}
