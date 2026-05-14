using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IEmployeeDocumentRepository
    {
        Task<IEnumerable<EmployeeDocument>> GetByUserIdAsync(long userId);
        Task<EmployeeDocument?> GetByIdAsync(long id);
        Task<long> CreateAsync(EmployeeDocument entity);
        Task<bool> DeleteAsync(long id);
        Task<bool> UserExistsAsync(long userId);
    }
}
