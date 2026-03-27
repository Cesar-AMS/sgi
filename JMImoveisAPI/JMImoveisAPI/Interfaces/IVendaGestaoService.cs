using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IVendaGestaoService
    {
        Task<bool> UpdateAsync(VendasV2 item);
        Task<bool> DeleteAsync(int id);
    }
}
