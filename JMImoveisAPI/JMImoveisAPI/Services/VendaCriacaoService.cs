using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class VendaCriacaoService : IVendaCriacaoService
    {
        private readonly IVendaRepository _vendaRepository;
        private readonly IFinanceIntegrationService _financeIntegrationService;

        public VendaCriacaoService(
            IVendaRepository vendaRepository,
            IFinanceIntegrationService financeIntegrationService)
        {
            _vendaRepository = vendaRepository;
            _financeIntegrationService = financeIntegrationService;
        }

        public async Task<int> CreateAsync(VendasV2 item)
        {
            item.GenerateNotification = false;
            item.SelledAt = item.SelledAt ?? DateTime.Now;
            item.GrossEarnings = 0;
            item.PaymentTypesId = 1;
            item.TaxComission = 0;
            item.TaxComissionStatus = "PAID";
            item.PercentageToTax = 0;

            item.GrossEarnings = item.ValueToRealstate ?? 0;

            if (item.BranchId is null)
            {
                item.BranchId = 1;
            }

            var id = await _vendaRepository.CreateAsync(item);

            item.Id = id;

            var options = new FinanceMappingOptions(
                SeriesIdReceivables: 1,
                SeriesIdPayables: 1,
                CategoryActs: 1,
                CategoryInstallments: 1,
                CategoryRealtor: 1,
                CategoryManager: 19,
                CategoryFinancial: 19,
                AccountReceivables: 16,
                AccountPayables: 16,
                CostCenterActs: 1,
                ClientId: item.CustomerId
            );

            await _financeIntegrationService.RegisterSaleFinancialsAsync(item, options);

            return id;
        }
    }
}
