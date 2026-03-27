using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ICustoPessoalRepository
    {
        Task<IEnumerable<CustoPessoal>> GetAllAsync();
        Task<CustoPessoal?> GetByIdAsync(int id);
        Task<int> CreateAsync(CustoPessoal entity);
        Task<bool> UpdateAsync(CustoPessoal entity);
        Task<bool> DeleteAsync(int id);
    }
}
