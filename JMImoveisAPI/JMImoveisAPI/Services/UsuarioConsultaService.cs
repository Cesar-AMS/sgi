using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class UsuarioConsultaService : IUsuarioConsultaService
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public UsuarioConsultaService(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        public async Task<IEnumerable<Usuario>> GetCorretoresAsync()
        {
            return await _usuarioRepository.GetCorretoresAsync();
        }

        public async Task<IEnumerable<Usuario>> GetGerentesAsync()
        {
            return await _usuarioRepository.GetGerentesAsync();
        }

        public async Task<IEnumerable<Usuario>> GetCoordenadoresAsync()
        {
            return await _usuarioRepository.GetCoordenadoresAsync();
        }

        public async Task<IEnumerable<Usuario>> GetUsersByRoleAndBranchAsync(int branchId, int roleId, int status)
        {
            return await _usuarioRepository.GetUsersByRoleAndBranchAsync(branchId, roleId, status);
        }
    }
}
