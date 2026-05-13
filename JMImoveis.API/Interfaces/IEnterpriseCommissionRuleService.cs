using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IEnterpriseCommissionRuleService
    {
        Task<IEnumerable<EnterpriseCommissionRule>> ListByEnterpriseAsync(long enterpriseId);
        Task<IEnumerable<EnterpriseCommissionRule>> ListActiveByEnterpriseAsync(long enterpriseId, string? ruleType);
        Task<EnterpriseCommissionRule> CreateAsync(EnterpriseCommissionRule rule);
        Task<EnterpriseCommissionRule?> UpdateAsync(long id, EnterpriseCommissionRule rule);
        Task<bool> DeactivateAsync(long id);
    }
}
