using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IFinanceIntegrationService
    {
        Task RegisterSaleFinancialsAsync(VendasV2 sale, FinanceMappingOptions opt);
    }
}
