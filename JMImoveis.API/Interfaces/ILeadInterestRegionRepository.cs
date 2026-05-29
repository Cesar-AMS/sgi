using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadInterestRegionRepository
    {
        Task<IEnumerable<LeadInterestRegion>> ListAsync();
        Task<IEnumerable<LeadInterestRegion>> ListActiveAsync();
        Task<LeadInterestRegion?> GetByIdAsync(int id);
        Task<bool> ExistsByNameAsync(string name, int? exceptId = null);
        Task<int> CreateAsync(LeadInterestRegion region);
        Task<bool> UpdateAsync(LeadInterestRegion region);
        Task<bool> ToggleAsync(int id, bool isActive);
        Task<bool> DeleteAsync(int id);
    }
}
