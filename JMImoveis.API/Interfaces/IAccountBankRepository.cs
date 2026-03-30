using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IAccountBankRepository
    {
        Task<IEnumerable<AccountBank>> GetAllAsync(bool onlyActive = true);
        Task<AccountBank?> GetByIdAsync(int id);
        Task<int> CreateAsync(AccountBank a);          // retorna novo Id
        Task<bool> UpdateAsync(int id, AccountBank a);
        Task<bool> SetActiveAsync(int id, bool active);
        Task<bool> DeleteAsync(int id);                // hard delete

        Task<bool> CreditAsync(int id, decimal value); // aumenta amountactual
        Task<bool> DebitAsync(int id, decimal value);  // diminui amountactual (sem deixar negativo)
    }
}
