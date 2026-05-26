using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadPostVisitRepository
    {
        Task<bool> LeadExistsAsync(int leadId);
        Task<LeadPostVisit?> GetByLeadIdAsync(int leadId);
        Task<LeadPostVisit?> GetByIdAsync(long id);
        Task<IEnumerable<LeadPostVisitListItem>> ListAsync(
            string? status,
            long? agentId,
            string? search,
            DateTime? followUpFrom,
            DateTime? followUpTo);
        Task<long> CreateAsync(LeadPostVisit postVisit);
        Task<bool> UpdateAsync(LeadPostVisit postVisit);
        Task<bool> UpdateStatusAsync(long id, string status);
    }
}
