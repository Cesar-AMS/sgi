using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadTransferHistoryService
    {
        Task RegisterIfResponsibleChangedAsync(Lead previousLead, Lead updatedLead, long? changedByUserId);
        Task<IEnumerable<LeadTransferHistory>> GetByLeadIdAsync(int leadId);
    }
}
