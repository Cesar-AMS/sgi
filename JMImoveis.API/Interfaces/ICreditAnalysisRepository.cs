using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ICreditAnalysisRepository
    {
        Task<CreditAnalysis?> GetBySaleIdAsync(int saleId);
        Task<CreditAnalysis> CreateAsync(CreditAnalysis entity);
        Task<bool> UpdateAsync(CreditAnalysis entity);
    }
}
