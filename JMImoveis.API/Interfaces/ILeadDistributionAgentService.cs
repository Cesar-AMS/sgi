using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadDistributionAgentService
    {
        Task<IEnumerable<LeadDistributionAgent>> ListAsync();
        Task<LeadDistributionAgent> CreateAsync(CreateLeadDistributionAgentRequest request);
        Task<LeadDistributionAgent> UpdateAsync(long id, UpdateLeadDistributionAgentRequest request);
        Task<LeadDistributionAgent> ToggleAsync(long id, ToggleLeadDistributionAgentRequest request);
        Task DeleteAsync(long id);
    }
}
