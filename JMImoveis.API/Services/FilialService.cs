using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class FilialService : IFilialService
    {
        private readonly IFilialRepository _filialRepository;

        public FilialService(IFilialRepository filialRepository)
        {
            _filialRepository = filialRepository;
        }

        public Task<IEnumerable<Filial>> GetAllAsync()
        {
            return _filialRepository.GetAllAsync();
        }

        public Task<Filial?> GetByIdAsync(int id)
        {
            return _filialRepository.GetByIdAsync(id);
        }

        public Task CreateAsync(Filial entity)
        {
            return _filialRepository.CreateAsync(entity);
        }

        public Task<bool> UpdateAsync(Filial entity)
        {
            return _filialRepository.UpdateAsync(entity);
        }

        public Task<bool> DeleteAsync(int id)
        {
            return _filialRepository.DeleteAsync(id);
        }
    }
}
