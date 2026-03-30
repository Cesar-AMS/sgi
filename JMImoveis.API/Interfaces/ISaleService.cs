using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ISaleService
    {
        Task<int> CreateSaleWithParcelsAndFinancialAsync(SaleV2 sale, IEnumerable<ParcelV2> parcels, IEnumerable<int> customerIds);
    }
}
