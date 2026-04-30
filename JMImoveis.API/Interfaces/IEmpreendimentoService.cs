using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IEmpreendimentoService
    {
        Task<IEnumerable<Enterprise>> GetAllAsync();
        Task<Enterprise?> GetByIdAsync(int id);
        Task<IEnumerable<UnitsEnterprise>> GetAllUnitsByEnterpriseAsync(int enterpriseId);
        Task<IEnumerable<UnitsEnterprise>> GetAllUnitsActivesByEnterpriseAsync(int enterpriseId);
        Task<IEnumerable<Enterprise?>> GetEnterpriseByConstructorAsync(int id);
        Task<IEnumerable<Enterprise?>> GetConstructorAsync();
        Task<int> CreateAsync(Enterprise entity);
        Task<bool> UpdateAsync(int id, Enterprise entity);
        Task<bool> SoftDeleteAsync(int id);
        Task<bool> HardDeleteAsync(int id);
        Task<bool> HasUnidadesAsync(int id);
    }
}
