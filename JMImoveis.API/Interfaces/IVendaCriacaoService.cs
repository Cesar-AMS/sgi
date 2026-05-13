using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IVendaCriacaoService
    {
        Task<int> CreateAsync(VendasV2 item);
        Task<int> CreateSaleOnlyAsync(VendasV2 item);
    }
}
