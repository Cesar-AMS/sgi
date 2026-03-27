using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    // Fachada de compatibilidade para manter os controllers atuais desacoplados
    // dos services especializados extraidos incrementalmente.
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioAuthService _usuarioAuthService;
        private readonly IUsuarioResetPasswordService _usuarioResetPasswordService;
        private readonly IUsuarioGestaoService _usuarioGestaoService;
        private readonly IUsuarioConsultaService _usuarioConsultaService;
        private readonly IUsuarioMenuService _usuarioMenuService;

        public UsuarioService(
            IUsuarioAuthService usuarioAuthService,
            IUsuarioResetPasswordService usuarioResetPasswordService,
            IUsuarioGestaoService usuarioGestaoService,
            IUsuarioConsultaService usuarioConsultaService,
            IUsuarioMenuService usuarioMenuService)
        {
            _usuarioAuthService = usuarioAuthService;
            _usuarioResetPasswordService = usuarioResetPasswordService;
            _usuarioGestaoService = usuarioGestaoService;
            _usuarioConsultaService = usuarioConsultaService;
            _usuarioMenuService = usuarioMenuService;
        }

        public async Task<(string? token, int? id)> AuthenticateAsync(string email, string password)
        {
            return await _usuarioAuthService.AuthenticateAsync(email, password);
        }

        public async Task<IEnumerable<Usuario>> GetAllAsync(string status)
        {
            return await _usuarioGestaoService.GetAllAsync(status);
        }

        public async Task<IEnumerable<Usuario>> GetAllByEnterpriseAsync(int enterprise)
        {
            return await _usuarioGestaoService.GetAllByEnterpriseAsync(enterprise);
        }

        public async Task<Usuario?> GetByIdAsync(int id)
        {
            return await _usuarioGestaoService.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Usuario>> GetCorretoresAsync()
        {
            return await _usuarioConsultaService.GetCorretoresAsync();
        }

        public async Task<IEnumerable<Usuario>> GetGerentesAsync()
        {
            return await _usuarioConsultaService.GetGerentesAsync();
        }

        public async Task<IEnumerable<Usuario>> GetCoordenadoresAsync()
        {
            return await _usuarioConsultaService.GetCoordenadoresAsync();
        }

        public async Task<IEnumerable<Usuario>> GetUsersByRoleAndBranchAsync(int branchId, int roleId, int status)
        {
            return await _usuarioConsultaService.GetUsersByRoleAndBranchAsync(branchId, roleId, status);
        }

        public async Task<List<MenuItemDto>> GetUserMenuAsync(int userId)
        {
            return await _usuarioMenuService.GetUserMenuAsync(userId);
        }

        public async Task UpdateMenuAsync(List<MenuItemDto> menu, int userId)
        {
            await _usuarioMenuService.UpdateMenuAsync(menu, userId);
        }

        public async Task CreateAsync(Usuario entity)
        {
            await _usuarioGestaoService.CreateAsync(entity);
        }

        public async Task<bool> UpdateAsync(Usuario entity)
        {
            return await _usuarioGestaoService.UpdateAsync(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _usuarioGestaoService.DeleteAsync(id);
        }

        public async Task<bool> ResetPasswordAsync(string email)
        {
            return await _usuarioResetPasswordService.ResetPasswordAsync(email);
        }
    }
}
