using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IContractService
    {
        Task<Contract?> GetBySaleIdAsync(int saleId);
        Task<Contract> CreateAsync(Contract entity);
        Task<bool> UpdateAsync(Contract entity);
    }
}
