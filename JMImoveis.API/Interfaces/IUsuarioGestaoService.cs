using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IUsuarioGestaoService
    {
        Task<IEnumerable<Usuario>> GetAllAsync(string status);
        Task<IEnumerable<Usuario>> GetAllByEnterpriseAsync(int enterprise);
        Task<Usuario?> GetByIdAsync(int id);
        Task CreateAsync(Usuario entity);
        Task<bool> UpdateAsync(Usuario entity);
        Task<bool> UpdateAccessEnabledAsync(int id, bool accessEnabled);
        Task<bool> DeleteAsync(int id);
    }
}
