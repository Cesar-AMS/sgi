using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IExtractRepository
    {
        Task<IEnumerable<ExtractAccountBank>> GetByAccountAsync(int accountId, DateTime? from = null, DateTime? to = null);
        Task<ExtractAccountBank?> GetAsync(int id);
        Task<int> CreateAsync(ExtractAccountBank e);     // atualiza saldo
        Task<bool> UpdateAsync(int id, ExtractAccountBank e); // ajusta delta no saldo
        Task<bool> DeleteAsync(int id);                  // desfaz impacto no saldo
    }
}
