using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IFinancialService
    {
        Task GenerateAccountsForSaleAsync(long saleId);
        Task<long> CreateSaleWithFinancialAsync(SaleV2 sale, IEnumerable<ParcelV2> parcels, List<int> customerIds);
        Task<IEnumerable<FinancialHistoryItemV2>> GetFinancialHistoryAsync(DateTime? from = null, DateTime? to = null);
    }
}
