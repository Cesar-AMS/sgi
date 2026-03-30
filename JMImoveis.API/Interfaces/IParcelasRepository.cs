using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IParcelasRepository
    {
        Task<IEnumerable<Parcelas>> GetAllAsync();
        Task<Parcelas?> GetByIdAsync(int id);
        Task<int> CreateAsync(Parcelas entity);
        Task<bool> UpdateAsync(Parcelas entity);
        Task<bool> DeleteAsync(int id);
    }
}
