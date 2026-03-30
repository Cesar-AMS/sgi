using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IFormasPagamentoRepository
    {
        Task<IEnumerable<PaymentType>> GetAllAsync();
        Task<PaymentType?> GetByIdAsync(int id);
        Task<int> CreateAsync(PaymentType entity);
        Task<bool> UpdateAsync(PaymentType entity);
        Task<bool> DeleteAsync(int id);
    }
}
