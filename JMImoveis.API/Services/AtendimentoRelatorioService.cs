using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class AtendimentoRelatorioService : IAtendimentoRelatorioService
    {
        private readonly IAtendimentoRelatorioRepository _repository;

        public AtendimentoRelatorioService(IAtendimentoRelatorioRepository repository)
        {
            _repository = repository;
        }

        public Task<AtendimentoRelatorioResponse> GetResumoAsync(
            DateTime? startAt,
            DateTime? finishAt,
            int? vendedorId,
            int? coordenadorId,
            int? gerenteId,
            long currentUserId,
            bool canViewAll)
        {
            return _repository.GetResumoAsync(
                startAt,
                finishAt,
                vendedorId,
                coordenadorId,
                gerenteId,
                currentUserId,
                canViewAll);
        }
    }
}