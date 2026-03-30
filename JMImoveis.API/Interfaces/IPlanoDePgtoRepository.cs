using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IPlanoDePgtoRepository
    {
        Task<IEnumerable<PlanoDePgto>> GetAllAsync();
        Task<PlanoDePgto?> GetByIdAsync(int id);
        Task<int> CreateAsync(PlanoDePgto entity);
        Task<bool> UpdateAsync(PlanoDePgto entity);
        Task<bool> DeleteAsync(int id);
    }
}
