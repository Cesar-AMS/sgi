using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadDistributionAgentRepository
    {
        Task<IEnumerable<LeadDistributionAgent>> ListAsync();
        Task<LeadDistributionAgent?> GetByIdAsync(long id);
        Task<bool> UserExistsAsync(long userId);
        Task<bool> ExistsByUserIdAsync(long userId, long? exceptId = null);
        Task<long> CreateAsync(LeadDistributionAgent agent);
        Task<bool> UpdateAsync(LeadDistributionAgent agent);
        Task<bool> ToggleAsync(long id, bool isActive);
        Task<bool> DeleteAsync(long id);
    }
}
