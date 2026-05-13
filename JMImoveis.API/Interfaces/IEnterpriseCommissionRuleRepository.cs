using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IEnterpriseCommissionRuleRepository
    {
        Task<IEnumerable<EnterpriseCommissionRule>> ListByEnterpriseAsync(long enterpriseId);
        Task<IEnumerable<EnterpriseCommissionRule>> ListActiveByEnterpriseAsync(long enterpriseId, string? ruleType);
        Task<EnterpriseCommissionRule?> GetByIdAsync(long id);
        Task<int> GetNextVersionAsync(long enterpriseId, string ruleType);
        Task<long> CreateAsync(EnterpriseCommissionRule rule);
        Task<bool> UpdateAsync(EnterpriseCommissionRule rule);
        Task DeactivateActiveByTypeAsync(long enterpriseId, string ruleType, long? exceptId = null);
        Task<bool> DeactivateAsync(long id);
    }
}
