using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IAccountPlainRepository
    {
        Task<IEnumerable<AccountPlain>> GetAllAsync();
        Task<AccountPlain?> GetAsync(int id);
        Task<int> CreateAsync(AccountPlain a);
        Task<bool> UpdateAsync(int id, AccountPlain a);
        Task<bool> DeleteAsync(int id);
    }
}
