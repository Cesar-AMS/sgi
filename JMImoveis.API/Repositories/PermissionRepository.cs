using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly DapperContext _context;

        public PermissionRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Permission>> GetAllPermissionsAsync()
        {
            const string sql = @"
                SELECT *
                  FROM jmoficial.permissions
                 WHERE is_active = 1
                 ORDER BY module, name";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Permission>(sql);
        }

        public async Task<IEnumerable<Permission>> GetRolePermissionsAsync(long roleId)
        {
            const string sql = @"
                SELECT p.*
                  FROM jmoficial.permissions p
                  JOIN jmoficial.role_permissions rp ON rp.permission_id = p.id
                 WHERE rp.role_id = @RoleId
                   AND p.is_active = 1
                 ORDER BY p.module, p.name";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Permission>(sql, new { RoleId = roleId });
        }

        public async Task ReplaceRolePermissionsAsync(long roleId, IEnumerable<long> permissionIds)
        {
            var ids = permissionIds.Distinct().ToList();
            await using var conn = await _context.OpenConnectionAsync();
            await using var transaction = await conn.BeginTransactionAsync();

            try
            {
                await conn.ExecuteAsync(
                    "DELETE FROM jmoficial.role_permissions WHERE role_id = @RoleId",
                    new { RoleId = roleId },
                    transaction);

                if (ids.Count > 0)
                {
                    const string insertSql = @"
                        INSERT INTO jmoficial.role_permissions (role_id, permission_id, created_at)
                        VALUES (@RoleId, @PermissionId, NOW())";

                    await conn.ExecuteAsync(
                        insertSql,
                        ids.Select(permissionId => new { RoleId = roleId, PermissionId = permissionId }),
                        transaction);
                }

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<UserPermissionOverride>> GetUserOverridesAsync(long userId)
        {
            const string sql = @"
                SELECT upo.*,
                       p.permission_key AS PermissionKey
                  FROM jmoficial.user_permission_overrides upo
                  JOIN jmoficial.permissions p ON p.id = upo.permission_id
                 WHERE upo.user_id = @UserId
                 ORDER BY p.module, p.name";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<UserPermissionOverride>(sql, new { UserId = userId });
        }

        public async Task ReplaceUserOverridesAsync(long userId, IEnumerable<UserPermissionOverride> overrides)
        {
            var normalized = overrides
                .GroupBy(x => x.PermissionId)
                .Select(group => group.Last())
                .ToList();

            await using var conn = await _context.OpenConnectionAsync();
            await using var transaction = await conn.BeginTransactionAsync();

            try
            {
                await conn.ExecuteAsync(
                    "DELETE FROM jmoficial.user_permission_overrides WHERE user_id = @UserId",
                    new { UserId = userId },
                    transaction);

                if (normalized.Count > 0)
                {
                    const string insertSql = @"
                        INSERT INTO jmoficial.user_permission_overrides
                            (user_id, permission_id, effect, created_at, updated_at)
                        VALUES
                            (@UserId, @PermissionId, @Effect, NOW(), NOW())";

                    await conn.ExecuteAsync(
                        insertSql,
                        normalized.Select(item => new
                        {
                            UserId = userId,
                            item.PermissionId,
                            item.Effect
                        }),
                        transaction);
                }

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<Permission>> GetEffectiveUserPermissionsAsync(long userId)
        {
            const string sql = @"
                SELECT DISTINCT p.*
                  FROM jmoficial.permissions p
                  JOIN jmoficial.role_permissions rp ON rp.permission_id = p.id
                  JOIN jmoficial.user_roles ur ON ur.role_id = rp.role_id
                 WHERE ur.user_id = @UserId
                   AND p.is_active = 1
                   AND NOT EXISTS (
                       SELECT 1
                         FROM jmoficial.user_permission_overrides deny_override
                        WHERE deny_override.user_id = @UserId
                          AND deny_override.permission_id = p.id
                          AND deny_override.effect = 'DENY'
                   )

                UNION

                SELECT DISTINCT p.*
                  FROM jmoficial.permissions p
                  JOIN jmoficial.user_permission_overrides allow_override
                    ON allow_override.permission_id = p.id
                 WHERE allow_override.user_id = @UserId
                   AND allow_override.effect = 'ALLOW'
                   AND p.is_active = 1

                 ORDER BY module, name";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Permission>(sql, new { UserId = userId });
        }

        public async Task<bool> RoleExistsAsync(long roleId)
        {
            const string sql = "SELECT COUNT(1) FROM jmoficial.roles WHERE id = @RoleId";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, new { RoleId = roleId }) > 0;
        }

        public async Task<bool> UserExistsAsync(long userId)
        {
            const string sql = "SELECT COUNT(1) FROM jmoficial.users WHERE id = @UserId";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, new { UserId = userId }) > 0;
        }

        public async Task<bool> PermissionsExistAsync(IEnumerable<long> permissionIds)
        {
            var ids = permissionIds.Distinct().ToList();
            if (ids.Count == 0)
            {
                return true;
            }

            const string sql = @"
                SELECT COUNT(1)
                  FROM jmoficial.permissions
                 WHERE id IN @PermissionIds
                   AND is_active = 1";

            await using var conn = await _context.OpenConnectionAsync();
            var count = await conn.ExecuteScalarAsync<int>(sql, new { PermissionIds = ids });
            return count == ids.Count;
        }
    }
}
