using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IFilialService
    {
        Task<IEnumerable<Filial>> GetAllAsync();
        Task<Filial?> GetByIdAsync(int id);
        Task CreateAsync(Filial entity);
        Task<bool> UpdateAsync(Filial entity);
        Task<bool> DeleteAsync(int id);
    }
}
