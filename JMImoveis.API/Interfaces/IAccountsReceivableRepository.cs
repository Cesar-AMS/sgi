using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IAccountsReceivableRepository
    {
        Task<PagedResult<AccountsReceivableRowDto>> GetPagedAsync(AccountsReceivableQuery q, int page, int pageSize);
        Task<AccountsReceivableSummaryDto> GetSummaryAsync(AccountsReceivableQuery q);
        Task<AccountsReceivableRowDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(CreateAccountsReceivableRequest req);
        Task<bool> UpdateAsync(int id, UpdateAccountsReceivableRequest req);
        Task<bool> CancelAsync(int id, CancelAccountsReceivableRequest req);
        Task<bool> HasAnyBySaleIdAsync(int saleId);

        Task SettleAsync(int id, SettleAccountsReceivableRequest req);
    }
}
