using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IClienteRepository
    {
        Task<IEnumerable<Cliente>> GetAllAsync();
        Task<Cliente?> GetByIdAsync(int id);
        Task<Cliente?> GetDependentByClientIdAsync(int id);
        Task<IEnumerable<Cliente?>> GetByTerms(string terms);
        Task<int> CreateAsync(Cliente entity);
        Task<bool> UpdateAsync(Cliente entity);
        Task<bool> DeleteAsync(int id);
        Task InsertDependents(int customerId, int dependentId);
    }
}
