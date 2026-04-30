using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class VendaGestaoService : IVendaGestaoService
    {
        private readonly IVendaRepository _vendaRepository;
        private readonly IFinancialService _financialService;

        public VendaGestaoService(
            IVendaRepository vendaRepository,
            IFinancialService financialService)
        {
            _vendaRepository = vendaRepository;
            _financialService = financialService;
        }

        public async Task<bool> UpdateAsync(VendasV2 item)
        {
            var updated = await _vendaRepository.UpdateAsync(item);
            if (updated && IsApprovedSaleStatus(item.Status))
            {
                await _financialService.GenerateAccountsForSaleAsync(item.Id);
            }

            return updated;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _vendaRepository.DeleteAsync(id);
        }

        public async Task<(bool Success, string? Error)> RegistrarAtoAsync(int id)
        {
            var venda = await _vendaRepository.GetByIdAsync(id);
            if (venda is null)
            {
                return (false, "SALE_NOT_FOUND");
            }

            var statusAtual = (venda.Status ?? string.Empty).Trim().ToUpperInvariant();
            if (statusAtual != "RESERVED" && statusAtual != "RESERVADO")
            {
                return (false, "INVALID_STATUS");
            }

            var vendaAtualizada = await _vendaRepository.RegistrarAtoAsync(id);
            if (!vendaAtualizada)
            {
                return (false, "SALE_UPDATE_FAILED");
            }

            var unidadeId = Convert.ToInt64(venda.UnitId);
            var unidadeAtualizada = await _vendaRepository.AtualizarStatusUnidadeAsync(unidadeId, "SELL");
            if (!unidadeAtualizada)
            {
                return (false, "UNIT_STATUS_UPDATE_FAILED");
            }

            await _financialService.GenerateAccountsForSaleAsync(id);

            return (true, null);
        }

        private static bool IsApprovedSaleStatus(string? status)
        {
            var normalized = (status ?? string.Empty).Trim().ToUpperInvariant();
            return normalized is "APROVADO" or "APPROVED" or "SELL" or "SOLD" or "VENDIDO";
        }
    }
}
