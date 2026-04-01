using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IConstructorTransferService
    {
        Task<ConstructorTransfer?> GetBySaleIdAsync(int saleId);
        Task<ConstructorTransfer> CreateAsync(ConstructorTransfer entity);
        Task<bool> UpdateAsync(ConstructorTransfer entity);
    }
}
