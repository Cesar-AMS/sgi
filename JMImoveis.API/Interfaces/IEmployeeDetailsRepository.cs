using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IEmployeeDetailsRepository
    {
        Task<EmployeeDetails?> GetByUserIdAsync(long userId);
        Task<long> CreateAsync(EmployeeDetails entity);
        Task<bool> UpdateByUserIdAsync(long userId, EmployeeDetails entity);
        Task<EmployeeDetails> UpsertByUserIdAsync(long userId, EmployeeDetails entity);
        Task<bool> ExistsByUserIdAsync(long userId);
        Task<bool> UserExistsAsync(long userId);
    }
}
