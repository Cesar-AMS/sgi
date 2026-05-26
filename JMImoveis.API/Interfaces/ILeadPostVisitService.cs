using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadPostVisitService
    {
        Task<LeadPostVisit?> GetByLeadIdAsync(int leadId);
        Task<IEnumerable<LeadPostVisitListItem>> ListAsync(
            string? status,
            long? agentId,
            string? search,
            DateTime? followUpFrom,
            DateTime? followUpTo);
        Task<LeadPostVisit> CreateOrGetByLeadIdAsync(int leadId, LeadPostVisitRequest request);
        Task<LeadPostVisit> UpdateByLeadIdAsync(int leadId, LeadPostVisitRequest request);
        Task<LeadPostVisit> UpdateStatusAsync(long id, UpdateLeadPostVisitStatusRequest request);
        Task<LeadPostVisit> MarkAsInProposalAsync(int leadId, long? proposalId);
    }
}
