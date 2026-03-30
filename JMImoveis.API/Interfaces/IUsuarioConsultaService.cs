using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IUsuarioConsultaService
    {
        Task<IEnumerable<Usuario>> GetCorretoresAsync();
        Task<IEnumerable<Usuario>> GetGerentesAsync();
        Task<IEnumerable<Usuario>> GetCoordenadoresAsync();
        Task<IEnumerable<Usuario>> GetUsersByRoleAndBranchAsync(int branchId, int roleId, int status);
    }
}
