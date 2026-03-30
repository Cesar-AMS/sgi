using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IVisitasRepository
    {
        Task<(IEnumerable<Visitas> Items, int Total)> ListAsync(VisitationsQuery q);
        Task<Visitas?> GetByIdAsync(int id);
        Task<int> CreateAsync(Visitas entity);
        Task<bool> UpdateAsync(Visitas entity);
        Task<bool> DeleteAsync(int id);
    }
}
