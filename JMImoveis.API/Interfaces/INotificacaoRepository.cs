using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface INotificacaoRepository
    {
        Task<IEnumerable<Notificacao>> GetAllAsync();
        Task<Notificacao?> GetByIdAsync(int id);
        Task<int> CreateAsync(Notificacao entity);
        Task<bool> UpdateAsync(Notificacao entity);
        Task<bool> DeleteAsync(int id);
    }
}
