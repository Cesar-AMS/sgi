using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class CreditAnalysisService : ICreditAnalysisService
    {
        private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "PENDENTE",
            "EM_ANALISE",
            "APROVADO",
            "REPROVADO"
        };

        private readonly ICreditAnalysisRepository _creditAnalysisRepository;

        public CreditAnalysisService(ICreditAnalysisRepository creditAnalysisRepository)
        {
            _creditAnalysisRepository = creditAnalysisRepository;
        }

        public Task<CreditAnalysis?> GetBySaleIdAsync(int saleId)
        {
            if (saleId <= 0)
            {
                throw new ArgumentException("saleId inválido.");
            }

            return _creditAnalysisRepository.GetBySaleIdAsync(saleId);
        }

        public Task<CreditAnalysis> CreateAsync(CreditAnalysis entity)
        {
            NormalizeAndValidate(entity);

            return _creditAnalysisRepository.CreateAsync(entity);
        }

        public Task<bool> UpdateAsync(CreditAnalysis entity)
        {
            if (entity.Id <= 0)
            {
                throw new ArgumentException("id inválido para atualização.");
            }

            NormalizeAndValidate(entity);

            return _creditAnalysisRepository.UpdateAsync(entity);
        }

        private static void NormalizeAndValidate(CreditAnalysis entity)
        {
            if (entity.SaleId <= 0)
            {
                throw new ArgumentException("saleId inválido.");
            }

            entity.Status = string.IsNullOrWhiteSpace(entity.Status) ? "PENDENTE" : entity.Status.Trim().ToUpperInvariant();

            if (!AllowedStatuses.Contains(entity.Status))
            {
                throw new ArgumentException("status inválido.");
            }

            entity.Summary ??= string.Empty;
            entity.Restrictions ??= string.Empty;
            entity.Observations ??= string.Empty;
            entity.AnalystName ??= string.Empty;
        }
    }
}
