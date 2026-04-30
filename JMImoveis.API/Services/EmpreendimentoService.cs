using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class EmpreendimentoService : IEmpreendimentoService
    {
        private readonly IEmpreendimentoRepository _empreendimentoRepository;

        public EmpreendimentoService(IEmpreendimentoRepository empreendimentoRepository)
        {
            _empreendimentoRepository = empreendimentoRepository;
        }

        public Task<IEnumerable<Enterprise>> GetAllAsync()
        {
            return _empreendimentoRepository.GetAllAsync();
        }

        public Task<Enterprise?> GetByIdAsync(int id)
        {
            return _empreendimentoRepository.GetByIdAsync(id);
        }

        public Task<IEnumerable<UnitsEnterprise>> GetAllUnitsByEnterpriseAsync(int enterpriseId)
        {
            return _empreendimentoRepository.GetAllUnitsByEnterprise(enterpriseId);
        }

        public Task<IEnumerable<UnitsEnterprise>> GetAllUnitsActivesByEnterpriseAsync(int enterpriseId)
        {
            return _empreendimentoRepository.GetAllUnitsActivesByEnterprise(enterpriseId);
        }

        public Task<IEnumerable<Enterprise?>> GetEnterpriseByConstructorAsync(int id)
        {
            return _empreendimentoRepository.GetEnterpriseByConstructorAsync(id);
        }

        public Task<IEnumerable<Enterprise?>> GetConstructorAsync()
        {
            return _empreendimentoRepository.GetConstructorAsync();
        }

        public Task<int> CreateAsync(Enterprise entity)
        {
            return _empreendimentoRepository.CreateAsync(entity);
        }

        public Task<bool> UpdateAsync(int id, Enterprise entity)
        {
            return _empreendimentoRepository.UpdateAsync(id, entity);
        }

        public Task<bool> SoftDeleteAsync(int id)
        {
            return _empreendimentoRepository.SoftDeleteAsync(id);
        }

        public Task<bool> HardDeleteAsync(int id)
        {
            return _empreendimentoRepository.HardDeleteAsync(id);
        }

        public Task<bool> HasUnidadesAsync(int id)
        {
            return _empreendimentoRepository.HasUnidadesAsync(id);
        }
    }
}
