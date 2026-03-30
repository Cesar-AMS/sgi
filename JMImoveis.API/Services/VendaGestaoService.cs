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
    }
}
