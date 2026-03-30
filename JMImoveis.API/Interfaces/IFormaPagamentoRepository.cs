using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IFormaPagamentoRepository
    {
        Task<IEnumerable<FormaPagamento>> GetAllAsync();
        Task<FormaPagamento?> GetByIdAsync(int id);
    }
}
