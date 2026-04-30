using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IApartamentosRepository
    {
        Task<IEnumerable<ApartmentUnit>> GetAllAsync(int enterpriseId);

        Task<IEnumerable<UnidadeDto>> GetEspelhoAsync(int enterpriseId);
        Task<ApartmentUnit?> GetByIdAsync(int id);
        Task<int> CreateAsync(ApartmentUnit u);
        Task<bool> UpdateAsync(int id, ApartmentUnit u);
        Task<bool> SoftDeleteAsync(int id);  // marca deleted_at / active = 0
        Task<bool> HardDeleteAsync(int id);  // remove fisicamente
        Task<IEnumerable<ApartmentUnit>> GetDisponiveisAsync();
        Task<bool> HasPropostaAtivaAsync(int id);
    }
}
