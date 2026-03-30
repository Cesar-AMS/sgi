using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IEmpreendimentoRepository
    {
        Task<IEnumerable<Enterprise>> GetAllAsync();
        Task<IEnumerable<UnitsEnterprise>> GetAllUnitsByEnterprise(int enterpriseId);
        Task<IEnumerable<UnitsEnterprise>> GetAllUnitsActivesByEnterprise(int enterpriseId);
        Task<Enterprise?> GetByIdAsync(int id);
        Task<IEnumerable<Enterprise?>> GetEnterpriseByConstructorAsync(int id);
        Task<IEnumerable<Enterprise?>> GetConstructorAsync();
        Task<int> CreateAsync(Enterprise entity);
        Task<bool> UpdateAsync(int id, Enterprise entity);
        Task<bool> SoftDeleteAsync(int id);
        Task<bool> HardDeleteAsync(int id);
    }
}
