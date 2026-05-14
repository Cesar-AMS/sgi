using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IExternalCollaboratorDetailsRepository
    {
        Task<ExternalCollaboratorDetails?> GetByUserIdAsync(long userId);
        Task<ExternalCollaboratorDetails> UpsertByUserIdAsync(long userId, ExternalCollaboratorDetails entity);
        Task<bool> UpdateContractAsync(long userId, string fileName, string relativePath, string contentType, long size);
        Task<bool> UserExistsAsync(long userId);
    }
}
