using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class CargoService : ICargoService
    {
        private readonly ICargoRepository _cargoRepository;

        public CargoService(ICargoRepository cargoRepository)
        {
            _cargoRepository = cargoRepository;
        }

        public Task<IEnumerable<Cargo>> GetAllAsync()
        {
            return _cargoRepository.GetAllAsync();
        }

        public Task<Cargo?> GetByIdAsync(int id)
        {
            return _cargoRepository.GetByIdAsync(id);
        }

        public Task<int> CreateAsync(Cargo entity)
        {
            return _cargoRepository.CreateAsync(entity);
        }

        public Task<bool> UpdateAsync(Cargo entity)
        {
            return _cargoRepository.UpdateAsync(entity);
        }

        public Task<bool> DeleteAsync(int id)
        {
            return _cargoRepository.DeleteAsync(id);
        }
    }
}
