using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IConstrutoraRepository
    {
        Task<IEnumerable<Constructor>> GetAllAsync(bool includeDeleted = false);
        Task<Constructor?> GetByIdAsync(int id);
        Task<int> CreateAsync(string name);
        Task<bool> UpdateAsync(int id, string name);
        Task<bool> SoftDeleteAsync(int id);
        Task<bool> HardDeleteAsync(int id);
    }
}
