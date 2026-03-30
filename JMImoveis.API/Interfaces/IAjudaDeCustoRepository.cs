using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IAjudaDeCustoRepository
    {
        Task<IEnumerable<AjudaDeCusto>> GetAllAsync();
        Task<AjudaDeCusto?> GetByIdAsync(int id);
        Task<int> CreateAsync(AjudaDeCusto entity);
        Task<bool> UpdateAsync(AjudaDeCusto entity);
        Task<bool> DeleteAsync(int id);
    }
}
