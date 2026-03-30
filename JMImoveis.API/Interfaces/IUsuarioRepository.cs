using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IUsuarioRepository
    {
        Task<IEnumerable<Usuario>> GetAllByEnterpriseAsync(int enterprise); // Usu�rios que tem acesso a uma empresa
        Task<IEnumerable<Usuario>> GetAllAsync(string status);
        Task<Usuario?> GetByIdAsync(int id);
        Task<IEnumerable<Usuario>> GetCorretoresAsync();
        Task<IEnumerable<Usuario>> GetGerentesAsync();

        Task<List<MenuItemDto>> GetUserMenuAsync(int userId);

        Task UpdateMenuAsync(List<MenuItemDto> menu, int userId);

        Task<IEnumerable<Usuario>> GetCoordenadoresAsync();
        Task<IEnumerable<Usuario>> GetUsersByRoleAndBranchAsync(int branchId, int roleId, int status); // 0 - Exibir ativos, 1 - Exibir Ocultos, 2 - Exibir todos
        Task CreateAsync(Usuario entity);
        Task<bool> UpdateAsync(Usuario entity);
        Task<bool> DeleteAsync(int id);

        Task<Usuario?> GetByEmailAsync(string email);
        Task UpdatePasswordAsync(int id, string novaSenha);


    }
}
