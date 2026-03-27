using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IVisitaRepository
    {
        Task<IEnumerable<Visita>> GetAllAsync();
        Task<Visita?> GetByIdAsync(int id);
    }
}
