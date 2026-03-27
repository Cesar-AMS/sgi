using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IUsuarioService
    {
        Task<(string? token, int? id)> AuthenticateAsync(string email, string password);
        Task<bool> ResetPasswordAsync(string email);
        Task<IEnumerable<Usuario>> GetAllAsync(string status);
        Task<IEnumerable<Usuario>> GetAllByEnterpriseAsync(int enterprise);
        Task<Usuario?> GetByIdAsync(int id);
        Task<IEnumerable<Usuario>> GetCorretoresAsync();
        Task<IEnumerable<Usuario>> GetGerentesAsync();
        Task<IEnumerable<Usuario>> GetCoordenadoresAsync();
        Task<IEnumerable<Usuario>> GetUsersByRoleAndBranchAsync(int branchId, int roleId, int status);
        Task<List<MenuItemDto>> GetUserMenuAsync(int userId);
        Task UpdateMenuAsync(List<MenuItemDto> menu, int userId);
        Task CreateAsync(Usuario entity);
        Task<bool> UpdateAsync(Usuario entity);
        Task<bool> DeleteAsync(int id);
    }
}
