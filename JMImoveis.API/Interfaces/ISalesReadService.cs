using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ISalesReadService
    {
        Task<VendasV2?> GetSaleFullAsync(int saleId, FinanceMappingOptions map, string connectionString);
    }
}
