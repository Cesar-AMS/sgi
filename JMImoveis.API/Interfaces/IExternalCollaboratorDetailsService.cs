using JMImoveisAPI.Entities;
using Microsoft.AspNetCore.Http;

namespace JMImoveisAPI.Interfaces
{
    public interface IExternalCollaboratorDetailsService
    {
        Task<ExternalCollaboratorDetails?> GetByUserIdAsync(long userId);
        Task<ExternalCollaboratorDetails> UpsertByUserIdAsync(long userId, ExternalCollaboratorDetails entity);
        Task<ExternalCollaboratorDetails> SaveContractAsync(long userId, IFormFile file);
        Task<(byte[] Content, string ContentType, string FileName)?> GetContractAsync(long userId);
    }
}
