using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadDocumentRepository
    {
        Task<bool> LeadExistsAsync(int leadId);
        Task<IEnumerable<LeadDocument>> GetByLeadIdAsync(int leadId);
        Task<LeadDocument?> GetByIdAsync(int leadId, long documentId);
        Task<long> CreateAsync(LeadDocument document);
        Task<bool> UpdateAsync(int leadId, long documentId, string displayName, string? description);
        Task<bool> SoftDeleteAsync(int leadId, long documentId);
    }
}
