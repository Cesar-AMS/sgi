using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadSourceRepository
    {
        Task<IEnumerable<LeadSource>> ListAsync();
        Task<IEnumerable<LeadSource>> ListActiveAsync();
        Task<LeadSource?> GetByIdAsync(int id);
        Task<bool> ExistsByNameAsync(string name, int? exceptId = null);
        Task<int> CreateAsync(LeadSource source);
        Task<bool> UpdateAsync(LeadSource source);
        Task<bool> ToggleAsync(int id, bool isActive);
        Task<bool> DeleteAsync(int id);
    }
}
