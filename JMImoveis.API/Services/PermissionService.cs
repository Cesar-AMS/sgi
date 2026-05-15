using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class PermissionService : IPermissionService
    {
        private static readonly HashSet<string> AllowedEffects = new(StringComparer.OrdinalIgnoreCase)
        {
            "ALLOW",
            "DENY"
        };

        private readonly IPermissionRepository _permissionRepository;

        public PermissionService(IPermissionRepository permissionRepository)
        {
            _permissionRepository = permissionRepository;
        }

        public async Task<IEnumerable<Permission>> GetAllPermissionsAsync()
        {
            return await _permissionRepository.GetAllPermissionsAsync();
        }

        public async Task<IEnumerable<Permission>> GetRolePermissionsAsync(long roleId)
        {
            await ValidateRoleAsync(roleId);
            return await _permissionRepository.GetRolePermissionsAsync(roleId);
        }

        public async Task ReplaceRolePermissionsAsync(long roleId, IEnumerable<long> permissionIds)
        {
            await ValidateRoleAsync(roleId);

            ValidatePermissionIds(permissionIds);
            var ids = NormalizePermissionIds(permissionIds);
            await ValidatePermissionsAsync(ids);

            await _permissionRepository.ReplaceRolePermissionsAsync(roleId, ids);
        }

        public async Task<IEnumerable<UserPermissionOverride>> GetUserOverridesAsync(long userId)
        {
            await ValidateUserAsync(userId);
            return await _permissionRepository.GetUserOverridesAsync(userId);
        }

        public async Task ReplaceUserOverridesAsync(long userId, IEnumerable<UserPermissionOverride> overrides)
        {
            await ValidateUserAsync(userId);

            var overrideList = (overrides ?? Enumerable.Empty<UserPermissionOverride>()).ToList();
            ValidatePermissionIds(overrideList.Select(item => item.PermissionId));

            var normalized = overrideList
                .Select(item => new UserPermissionOverride
                {
                    UserId = userId,
                    PermissionId = item.PermissionId,
                    Effect = NormalizeEffect(item.Effect)
                })
                .ToList();

            var invalidEffect = normalized.FirstOrDefault(item => !AllowedEffects.Contains(item.Effect));
            if (invalidEffect != null)
            {
                throw new ArgumentException("Effect aceita somente ALLOW ou DENY.");
            }

            var permissionIds = NormalizePermissionIds(normalized.Select(item => item.PermissionId));
            await ValidatePermissionsAsync(permissionIds);

            await _permissionRepository.ReplaceUserOverridesAsync(userId, normalized);
        }

        public async Task<IEnumerable<Permission>> GetEffectiveUserPermissionsAsync(long userId)
        {
            await ValidateUserAsync(userId);
            return await _permissionRepository.GetEffectiveUserPermissionsAsync(userId);
        }

        public async Task<bool> UserHasPermissionAsync(long userId, string permissionKey)
        {
            if (userId <= 0 || string.IsNullOrWhiteSpace(permissionKey))
            {
                return false;
            }

            var permissions = await GetEffectiveUserPermissionsAsync(userId);
            var permissionKeys = permissions
                .Select(permission => permission.PermissionKey)
                .Where(key => !string.IsNullOrWhiteSpace(key))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            return permissionKeys.Contains("sistema.admin.total")
                || permissionKeys.Contains(permissionKey.Trim());
        }

        private async Task ValidateRoleAsync(long roleId)
        {
            if (roleId <= 0)
            {
                throw new ArgumentException("RoleId invalido.");
            }

            if (!await _permissionRepository.RoleExistsAsync(roleId))
            {
                throw new KeyNotFoundException("Perfil/cargo nao encontrado.");
            }
        }

        private async Task ValidateUserAsync(long userId)
        {
            if (userId <= 0)
            {
                throw new ArgumentException("UserId invalido.");
            }

            if (!await _permissionRepository.UserExistsAsync(userId))
            {
                throw new KeyNotFoundException("Usuario nao encontrado.");
            }
        }

        private async Task ValidatePermissionsAsync(IEnumerable<long> permissionIds)
        {
            var ids = NormalizePermissionIds(permissionIds);

            if (!await _permissionRepository.PermissionsExistAsync(ids))
            {
                throw new ArgumentException("Uma ou mais permissoes informadas nao existem ou estao inativas.");
            }
        }

        private static void ValidatePermissionIds(IEnumerable<long>? permissionIds)
        {
            if ((permissionIds ?? Enumerable.Empty<long>()).Any(id => id <= 0))
            {
                throw new ArgumentException("PermissionId invalido.");
            }
        }

        private static List<long> NormalizePermissionIds(IEnumerable<long>? permissionIds)
        {
            return (permissionIds ?? Enumerable.Empty<long>())
                .Where(id => id > 0)
                .Distinct()
                .ToList();
        }

        private static string NormalizeEffect(string? effect)
        {
            return (effect ?? string.Empty).Trim().ToUpperInvariant();
        }
    }
}
