using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ITipoPagamentoRepository
    {
        Task<IEnumerable<TipoPagamento>> GetAllAsync();
        Task<TipoPagamento?> GetByIdAsync(int id);
        Task<int> CreateAsync(TipoPagamento entity);
        Task<bool> UpdateAsync(TipoPagamento entity);
        Task<bool> DeleteAsync(int id);
    }
}
