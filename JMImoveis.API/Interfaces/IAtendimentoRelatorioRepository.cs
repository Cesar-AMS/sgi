using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IAtendimentoRelatorioRepository
    {
        Task<AtendimentoRelatorioResponse> GetResumoAsync(
            DateTime? startAt,
            DateTime? finishAt,
            int? vendedorId,
            int? coordenadorId,
            int? gerenteId,
            long currentUserId,
            bool canViewAll);
    }
}