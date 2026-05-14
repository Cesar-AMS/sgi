using JMImoveisAPI.Entities;
using Microsoft.AspNetCore.Http;

namespace JMImoveisAPI.Interfaces
{
    public interface IEmployeeDocumentService
    {
        Task<IEnumerable<EmployeeDocument>> GetByUserIdAsync(long userId);
        Task<EmployeeDocument> UploadAsync(long userId, IFormFile file, string? documentType, string? documentLabel, string? notes);
        Task<(byte[] Content, string ContentType, string FileName)?> DownloadAsync(long id);
        Task<bool> DeleteAsync(long id);
    }
}
