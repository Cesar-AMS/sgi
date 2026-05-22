using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadTransferHistoryRepository
    {
        Task<bool> LeadExistsAsync(int leadId);
        Task<long> CreateAsync(LeadTransferHistory history);
        Task<IEnumerable<LeadTransferHistory>> GetByLeadIdAsync(int leadId);
    }
}
