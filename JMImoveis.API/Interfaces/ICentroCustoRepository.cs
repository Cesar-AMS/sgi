using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ICentroCustoRepository
    {
        Task<IEnumerable<CentroCusto>> GetAllAsync();
        Task<CentroCusto?> GetByIdAsync(int id);
        Task CreateAsync(CentroCusto entity);
        Task<bool> UpdateAsync(CentroCusto entity);
        Task<bool> DeleteAsync(int id);
    }
}
