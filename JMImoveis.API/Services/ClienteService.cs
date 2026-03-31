using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class ClienteService : IClienteService
    {
        private readonly IClienteRepository _clienteRepository;

        public ClienteService(IClienteRepository clienteRepository)
        {
            _clienteRepository = clienteRepository;
        }

        public Task<IEnumerable<Cliente>> GetAllAsync()
        {
            return _clienteRepository.GetAllAsync();
        }

        public Task<Cliente?> GetByIdAsync(int id)
        {
            return _clienteRepository.GetByIdAsync(id);
        }

        public Task<Cliente?> GetDependentByClientIdAsync(int id)
        {
            return _clienteRepository.GetDependentByClientIdAsync(id);
        }

        public Task<IEnumerable<Cliente?>> GetByTermsAsync(string terms)
        {
            return _clienteRepository.GetByTerms(terms);
        }

        public Task<int> CreateAsync(Cliente entity)
        {
            return _clienteRepository.CreateAsync(entity);
        }

        public Task<bool> UpdateAsync(Cliente entity)
        {
            return _clienteRepository.UpdateAsync(entity);
        }

        public Task<bool> DeleteAsync(int id)
        {
            return _clienteRepository.DeleteAsync(id);
        }

        public Task InsertDependentsAsync(int customerId, int dependentId)
        {
            return _clienteRepository.InsertDependents(customerId, dependentId);
        }
    }
}
