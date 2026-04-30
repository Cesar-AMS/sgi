using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class VendaGestaoService : IVendaGestaoService
    {
        private readonly IVendaRepository _vendaRepository;

        public VendaGestaoService(IVendaRepository vendaRepository)
        {
            _vendaRepository = vendaRepository;
        }

        public async Task<bool> UpdateAsync(VendasV2 item)
        {
            return await _vendaRepository.UpdateAsync(item);
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

            return (true, null);
        }
    }
}
