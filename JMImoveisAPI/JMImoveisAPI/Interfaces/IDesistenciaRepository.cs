using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IDesistenciaRepository
    {
        Task<IEnumerable<Desistencia>> GetAllAsync();
        Task<Desistencia?> GetByIdAsync(int id);
        Task<int> CreateAsync(Desistencia entity);
        Task<bool> UpdateAsync(Desistencia entity);
        Task<bool> DeleteAsync(int id);
    }
}
