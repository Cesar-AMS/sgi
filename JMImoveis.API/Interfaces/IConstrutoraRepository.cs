using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IConstrutoraRepository
    {
        Task<IEnumerable<Constructor>> GetAllAsync(bool includeDeleted = false);
        Task<Constructor?> GetByIdAsync(int id);
        Task<int> CreateAsync(Constructor entity);
        Task<bool> UpdateAsync(int id, Constructor entity);
        Task<bool> SoftDeleteAsync(int id);
        Task<bool> HardDeleteAsync(int id);
        Task<bool> HasEmpreendimentosAsync(int id);
    }
}
