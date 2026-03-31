using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class FormasPagamentoService : IFormasPagamentoService
    {
        private readonly IFormasPagamentoRepository _formasPagamentoRepository;

        public FormasPagamentoService(IFormasPagamentoRepository formasPagamentoRepository)
        {
            _formasPagamentoRepository = formasPagamentoRepository;
        }

        public Task<IEnumerable<PaymentType>> GetAllAsync()
        {
            return _formasPagamentoRepository.GetAllAsync();
        }

        public Task<PaymentType?> GetByIdAsync(int id)
        {
            return _formasPagamentoRepository.GetByIdAsync(id);
        }

        public Task<int> CreateAsync(PaymentType entity)
        {
            return _formasPagamentoRepository.CreateAsync(entity);
        }

        public Task<bool> UpdateAsync(PaymentType entity)
        {
            return _formasPagamentoRepository.UpdateAsync(entity);
        }

        public Task<bool> DeleteAsync(int id)
        {
            return _formasPagamentoRepository.DeleteAsync(id);
        }
    }
}
