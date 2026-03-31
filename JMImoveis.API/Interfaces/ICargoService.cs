using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ICargoService
    {
        Task<IEnumerable<Cargo>> GetAllAsync();
        Task<Cargo?> GetByIdAsync(int id);
        Task<int> CreateAsync(Cargo entity);
        Task<bool> UpdateAsync(Cargo entity);
        Task<bool> DeleteAsync(int id);
    }
}
