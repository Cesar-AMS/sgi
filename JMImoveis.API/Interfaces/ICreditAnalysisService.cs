using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ICreditAnalysisService
    {
        Task<CreditAnalysis?> GetBySaleIdAsync(int saleId);
        Task<int> CreateAsync(CreditAnalysis entity);
        Task<bool> UpdateAsync(CreditAnalysis entity);
    }
}
