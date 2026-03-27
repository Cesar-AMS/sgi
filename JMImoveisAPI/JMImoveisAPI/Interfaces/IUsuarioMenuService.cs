using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IUsuarioMenuService
    {
        Task<List<MenuItemDto>> GetUserMenuAsync(int userId);
        Task UpdateMenuAsync(List<MenuItemDto> menu, int userId);
    }
}
