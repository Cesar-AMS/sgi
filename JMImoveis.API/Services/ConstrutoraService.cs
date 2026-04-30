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

        public Task<int> CreateAsync(Constructor entity)
        {
            return _construtoraRepository.CreateAsync(entity);
        }

        public Task<bool> UpdateAsync(int id, Constructor entity)
        {
            return _construtoraRepository.UpdateAsync(id, entity);
        }

        public Task<bool> SoftDeleteAsync(int id)
        {
            return _construtoraRepository.SoftDeleteAsync(id);
        }

        public Task<bool> HardDeleteAsync(int id)
        {
            return _construtoraRepository.HardDeleteAsync(id);
        }

        public Task<bool> HasEmpreendimentosAsync(int id)
        {
            return _construtoraRepository.HasEmpreendimentosAsync(id);
        }
    }
}
