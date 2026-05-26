using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IAccountsPayableRepository
    {
        Task<long> CreateAsync(CreateAccountsPayableRequest req);
        Task<(List<AccountsPayableRowDto> Items, int Total)> GetPagedAsync(AccountsPayableQuery q);
        Task<AccountsPayableSummaryDto> GetSummaryAsync(AccountsPayableQuery q);
        Task<AccountsPayableRowDto?> GetByIdAsync(long id);
        Task<bool> UpdateAsync(long id, UpdateAccountsPayableRequest req);
        Task<bool> CancelAsync(long id, CancelAccountsPayableRequest req);
        Task SettleAsync(long id, SettleAccountsPayableRequest req);
    }
}
