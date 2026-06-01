using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadSourceService
    {
        Task<IEnumerable<LeadSource>> ListAsync();
        Task<IEnumerable<LeadSource>> ListActiveAsync();
        Task<LeadSource> CreateAsync(CreateLeadSourceRequest request);
        Task<LeadSource> UpdateAsync(int id, UpdateLeadSourceRequest request);
        Task<LeadSource> ToggleAsync(int id, ToggleLeadSourceRequest request);
        Task DeleteAsync(int id);
    }
}
