using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IAccountsPayableService
    {
        Task<long> CreateAsync(CreateAccountsPayableRequest req);
        Task<(List<AccountsPayableRowDto> Items, int Total)> GetPagedAsync(AccountsPayableQuery q);
        Task<AccountsPayableSummaryDto> GetSummaryAsync(AccountsPayableQuery q);
        Task<AccountsPayableRowDto?> GetByIdAsync(long id);
        Task UpdateAsync(long id, UpdateAccountsPayableRequest req);
        Task CancelAsync(long id, CancelAccountsPayableRequest req);
        Task SettleAsync(long id, SettleAccountsPayableRequest req);
    }
}
