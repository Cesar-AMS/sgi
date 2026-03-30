using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IIntermediariasRepository
    {
        Task<IEnumerable<Intermediarias>> GetAllAsync();
        Task<Intermediarias?> GetByIdAsync(int id);
        Task<int> CreateAsync(Intermediarias entity);
        Task<bool> UpdateAsync(Intermediarias entity);
        Task<bool> DeleteAsync(int id);
    }
}
