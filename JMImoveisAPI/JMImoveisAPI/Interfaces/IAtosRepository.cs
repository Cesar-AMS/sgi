using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IAtosRepository
    {
        Task<IEnumerable<Atos>> GetAllAsync();
        Task<Atos?> GetByIdAsync(int id);
        Task<int> CreateAsync(Atos entity);
        Task<bool> UpdateAsync(Atos entity);
        Task<bool> DeleteAsync(int id);
    }
}
