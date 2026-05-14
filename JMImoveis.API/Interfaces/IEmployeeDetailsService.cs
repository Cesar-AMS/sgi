using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IEmployeeDetailsService
    {
        Task<EmployeeDetails?> GetByUserIdAsync(long userId);
        Task<EmployeeDetails> CreateAsync(EmployeeDetails entity);
        Task<EmployeeDetails> UpsertByUserIdAsync(long userId, EmployeeDetails entity);
    }
}
