using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IParcelaRepository
    {
        Task<IEnumerable<Parcela>> GetAllAsync();
        Task<Parcela?> GetByIdAsync(int id);
    }
}
