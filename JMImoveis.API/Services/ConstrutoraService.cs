using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class ConstrutoraService : IConstrutoraService
    {
        private readonly IConstrutoraRepository _construtoraRepository;

        public ConstrutoraService(IConstrutoraRepository construtoraRepository)
        {
            _construtoraRepository = construtoraRepository;
        }

        public Task<IEnumerable<Constructor>> GetAllAsync(bool includeDeleted = false)
        {
            return _construtoraRepository.GetAllAsync(includeDeleted);
        }

        public Task<Constructor?> GetByIdAsync(int id)
        {
            return _construtoraRepository.GetByIdAsync(id);
        }

        public Task<int> CreateAsync(string name)
        {
            return _construtoraRepository.CreateAsync(name);
        }

        public Task<bool> UpdateAsync(int id, string name)
        {
            return _construtoraRepository.UpdateAsync(id, name);
        }

        public Task<bool> SoftDeleteAsync(int id)
        {
            return _construtoraRepository.SoftDeleteAsync(id);
        }

        public Task<bool> HardDeleteAsync(int id)
        {
            return _construtoraRepository.HardDeleteAsync(id);
        }
    }
}
