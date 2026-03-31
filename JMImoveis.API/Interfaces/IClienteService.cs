using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IClienteService
    {
        Task<IEnumerable<Cliente>> GetAllAsync();
        Task<Cliente?> GetByIdAsync(int id);
        Task<Cliente?> GetDependentByClientIdAsync(int id);
        Task<IEnumerable<Cliente?>> GetByTermsAsync(string terms);
        Task<int> CreateAsync(Cliente entity);
        Task<bool> UpdateAsync(Cliente entity);
        Task<bool> DeleteAsync(int id);
        Task InsertDependentsAsync(int customerId, int dependentId);
    }
}
