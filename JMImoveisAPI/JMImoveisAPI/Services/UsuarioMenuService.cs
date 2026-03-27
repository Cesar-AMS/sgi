using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class UsuarioMenuService : IUsuarioMenuService
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public UsuarioMenuService(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        public async Task<List<MenuItemDto>> GetUserMenuAsync(int userId)
        {
            return await _usuarioRepository.GetUserMenuAsync(userId);
        }

        public async Task UpdateMenuAsync(List<MenuItemDto> menu, int userId)
        {
            await _usuarioRepository.UpdateMenuAsync(menu, userId);
        }
    }
}
