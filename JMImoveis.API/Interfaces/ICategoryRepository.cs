using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync(bool onlyActive = false);
        Task<Category?> GetAsync(int id);
        Task<int> CreateAsync(Category c);
        Task<bool> UpdateAsync(int id, Category c);
        Task<bool> SetStatusAsync(int id, bool status);
        Task<bool> DeleteAsync(int id);
    }
}
