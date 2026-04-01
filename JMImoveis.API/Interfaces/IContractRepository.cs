using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IContractRepository
    {
        Task<Contract?> GetBySaleIdAsync(int saleId);
        Task<Contract> CreateAsync(Contract entity);
        Task<bool> UpdateAsync(Contract entity);
    }
}
