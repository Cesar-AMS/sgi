using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class CreditAnalysisService : ICreditAnalysisService
    {
        private readonly ICreditAnalysisRepository _creditAnalysisRepository;

        public CreditAnalysisService(ICreditAnalysisRepository creditAnalysisRepository)
        {
            _creditAnalysisRepository = creditAnalysisRepository;
        }

        public Task<CreditAnalysis?> GetBySaleIdAsync(int saleId)
        {
            return _creditAnalysisRepository.GetBySaleIdAsync(saleId);
        }

        public Task<int> CreateAsync(CreditAnalysis entity)
        {
            entity.Status = string.IsNullOrWhiteSpace(entity.Status) ? "PENDENTE" : entity.Status;
            entity.Summary ??= string.Empty;
            entity.Restrictions ??= string.Empty;
            entity.Observations ??= string.Empty;
            entity.AnalystName ??= string.Empty;

            return _creditAnalysisRepository.CreateAsync(entity);
        }

        public Task<bool> UpdateAsync(CreditAnalysis entity)
        {
            entity.Status = string.IsNullOrWhiteSpace(entity.Status) ? "PENDENTE" : entity.Status;
            entity.Summary ??= string.Empty;
            entity.Restrictions ??= string.Empty;
            entity.Observations ??= string.Empty;
            entity.AnalystName ??= string.Empty;

            return _creditAnalysisRepository.UpdateAsync(entity);
        }
    }
}
