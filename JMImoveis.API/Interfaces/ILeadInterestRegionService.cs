using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadInterestRegionService
    {
        Task<IEnumerable<LeadInterestRegion>> ListAsync();
        Task<IEnumerable<LeadInterestRegion>> ListActiveAsync();
        Task<LeadInterestRegion> CreateAsync(CreateLeadInterestRegionRequest request);
        Task<LeadInterestRegion> UpdateAsync(int id, UpdateLeadInterestRegionRequest request);
        Task<LeadInterestRegion> ToggleAsync(int id, ToggleLeadInterestRegionRequest request);
        Task DeleteAsync(int id);
    }
}
