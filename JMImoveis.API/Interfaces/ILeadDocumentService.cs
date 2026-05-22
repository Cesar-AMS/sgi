using JMImoveisAPI.Entities;
using Microsoft.AspNetCore.Http;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadDocumentService
    {
        Task<IEnumerable<LeadDocument>> GetByLeadIdAsync(int leadId);
        Task<IEnumerable<LeadDocument>> UploadAsync(int leadId, IEnumerable<IFormFile> files, long? uploadedByUserId);
        Task<LeadDocument> UpdateAsync(int leadId, long documentId, UpdateLeadDocumentRequest request);
        Task<(byte[] Content, string ContentType, string FileName)?> DownloadAsync(int leadId, long documentId);
        Task<bool> DeleteAsync(int leadId, long documentId);
    }
}
