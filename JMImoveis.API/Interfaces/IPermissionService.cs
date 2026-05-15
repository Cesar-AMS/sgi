using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface IPermissionService
    {
        Task<IEnumerable<Permission>> GetAllPermissionsAsync();
        Task<IEnumerable<Permission>> GetRolePermissionsAsync(long roleId);
        Task ReplaceRolePermissionsAsync(long roleId, IEnumerable<long> permissionIds);
        Task<IEnumerable<UserPermissionOverride>> GetUserOverridesAsync(long userId);
        Task ReplaceUserOverridesAsync(long userId, IEnumerable<UserPermissionOverride> overrides);
        Task<IEnumerable<Permission>> GetEffectiveUserPermissionsAsync(long userId);
        Task<bool> UserHasPermissionAsync(long userId, string permissionKey);
    }
}
