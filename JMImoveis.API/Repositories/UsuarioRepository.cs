using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using System.Collections.Generic;
using System.Data;
using System.Text.Json;

namespace JMImoveisAPI.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly DapperContext _context;
        public UsuarioRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<Usuario>> GetAllByEnterpriseAsync(int enterprise)
        {
            var sql = $@"SELECT CASE 
			                        WHEN id_enterprise is null 
			                        THEN 0 
			                        ELSE 1 
		                        END 'EnterpriseVisibility' , 
		                        T0.* from users T0
                        LEFT JOIN user_enterprise T1 ON T0.id = T1.id_user AND T1.id_enterprise = {enterprise}
                        WHERE hidden = 0;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Usuario>(sql);
        }
        public async Task<IEnumerable<Usuario>> GetAllAsync(string status)
        {
            var whr = "";
            var parameters = new DynamicParameters();

            if(status == "active")
            {
                whr += "where T0.hidden = @Hidden";
                parameters.Add("Hidden", false);
            }

            if (status == "inactive")
            {
                whr += "where T0.hidden = @Hidden";
                parameters.Add("Hidden", true);
            }


            var sql = @$"SELECT T0.*,
                                T0.coordenator_id as ""CoordenatorId"",
                                T0.manager_id as ""ManagerId"",
                                T0.gestor_id as ""GestorId"",
                                T0.employment_type as ""EmploymentType"",
                                T0.access_enabled as ""AccessEnabled"",
                                manager.name as ""ManagerName"",
                                coordenator.name as ""CoordenatorName"",
                                gestor.name as ""GestorName""
                           FROM users T0
                           LEFT JOIN users manager ON manager.id = T0.manager_id
                           LEFT JOIN users coordenator ON coordenator.id = T0.coordenator_id
                           LEFT JOIN users gestor ON gestor.id = T0.gestor_id
                           {whr}
                          ORDER BY T0.name;";
            await using var conn = await _context.OpenConnectionAsync();
            var users = (await conn.QueryAsync<Usuario>(sql, parameters)).ToList();
            await PopulateUserRolesAsync(conn, users);
            return users;
        }

        public async Task<Usuario?> GetByEmailAsync(string email)
        {
            var sql = @"SELECT *,
                               access_enabled as ""AccessEnabled""
                          FROM users
                         WHERE email = @email";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Usuario>(sql, new { email });
        }

        public async Task<IEnumerable<Usuario>> GetCorretoresAsync()
        {
            var sql = $@"select distinct t0.* from users t0
                        inner join user_roles t1 on t0.id = t1.user_id 
                        where t1.role_id in (2,4,9) and t0.hidden = 0
                        order by 2";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Usuario>(sql);
        }

        public async Task<IEnumerable<Usuario>> GetUsersByRoleAndBranchAsync(int branchId, int roleId, int status)
        {
            var filters = new List<string>();
            var parameters = new DynamicParameters();

            if (roleId != 0)
            {
                filters.Add("UR.role_id = @RoleId");
                parameters.Add("RoleId", roleId);
            }

            if (status != 2)
            {
                filters.Add("T0.hidden = @Hidden");
                parameters.Add("Hidden", status);
            }

            if (branchId != 0)
            {
                filters.Add("T1.branch_id = @BranchId");
                parameters.Add("BranchId", branchId);
            }

            var where = filters.Count > 0
                ? "WHERE " + string.Join(" AND ", filters)
                : "";

            var sql = @$"SELECT DISTINCT T0.*
                         FROM users T0
                         LEFT JOIN user_roles UR ON T0.id = UR.user_id
                         LEFT JOIN user_branches T1 ON T0.id = T1.user_id
                         {where}
                         ORDER BY T0.name";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Usuario>(sql, parameters);
        }

        public async Task UpdateMenuAsync(List<MenuItemDto> menu, int userId)
        {
            var json = JsonSerializer.Serialize(menu, new JsonSerializerOptions
            {
                WriteIndented = false
            });

            const string sql = @"UPDATE users
                                   SET menu_json = @MenuJson
                                 WHERE Id = @UserId";

            await using var conn = await _context.OpenConnectionAsync();
             await conn.ExecuteAsync(sql, new
             {
                 UserId = userId,
                 MenuJson = json
             });
        }
        public async Task<List<MenuItemDto>> GetUserMenuAsync(int userId)
        {
            const string sql = @"SELECT menu_json FROM users WHERE Id = @UserId";

            await using var conn = await _context.OpenConnectionAsync();
            var json = await conn.ExecuteScalarAsync<string>(sql, new
            {
                UserId = userId
            });


            if (string.IsNullOrWhiteSpace(json))
                return new List<MenuItemDto>();

            return JsonSerializer.Deserialize<List<MenuItemDto>>(json)
                   ?? new List<MenuItemDto>();
        }

        public async Task<IEnumerable<Usuario>> GetGerentesAsync()
        {
            var sql = $@"select distinct t0.* from users t0
                            inner join user_roles t1 on t0.id = t1.user_id 
                            where t1.role_id = 3 and t0.hidden = 0
                            order by 2;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Usuario>(sql);
        }

        public async Task<IEnumerable<Usuario>> GetCoordenadoresAsync()
        {
            var sql = $@"select distinct t0.* from users t0
                        inner join user_roles t1 on t0.id = t1.user_id 
                        where t1.role_id = 11 and t0.hidden = 0
                        order by 2;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Usuario>(sql);
        }

        public async Task<Usuario?> GetByIdAsync(int id)
        {
            var sql = @$"SELECT T0.*,
                                T0.coordenator_id as ""CoordenatorId"",
                                T0.manager_id as ""ManagerId"",
                                T0.gestor_id as ""GestorId"",
                                T0.employment_type as ""EmploymentType"",
                                T0.access_enabled as ""AccessEnabled"",
                                manager.name as ""ManagerName"",
                                coordenator.name as ""CoordenatorName"",
                                gestor.name as ""GestorName""
                           FROM users T0
                           LEFT JOIN users manager ON manager.id = T0.manager_id
                           LEFT JOIN users coordenator ON coordenator.id = T0.coordenator_id
                           LEFT JOIN users gestor ON gestor.id = T0.gestor_id
                          WHERE T0.id = @id";

            await using var conn = await _context.OpenConnectionAsync();
            var user = await conn.QueryFirstOrDefaultAsync<Usuario>(sql, new { id });

            if (user != null)
            {
                await PopulateUserRolesAsync(conn, new List<Usuario> { user });
            }

            return user;
        }

        public async Task UpdatePasswordAsync(int id, string novaSenha)
        {
            var sql = "UPDATE users SET password = @novaSenha WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            await conn.ExecuteAsync(sql, new { id, novaSenha });
        }


        public async Task CreateAsync(Usuario entity)
        {
            const string insertUserSql = @"INSERT INTO users
                    (email, password, name, cpf, address, cellphone, admission_date, created_at, hidden,
                     manager_id, coordenator_id, gestor_id, employment_type, access_enabled)
                VALUES
                    (@Email, @Password, @Name, @Cpf, @Address, @Cellphone, @AdmissionDate, @CreatedAt, @Hidden,
                     @ManagerId, @CoordenatorId, @GestorId, @EmploymentType, @AccessEnabled);";

            const string insertUserBranchSql = @"INSERT INTO user_branches (branch_id, user_id, created_at, updated_at)
                                                 VALUES (@BranchId, @UserId, NOW(), NOW());";

            const string insertUserRoleSql = @"INSERT INTO user_roles (role_id, user_id, created_at, updated_at)
                                               VALUES (@RoleId, @UserId, NOW(), NOW());";

            await using var conn = await _context.OpenConnectionAsync();
            await using var tx = await conn.BeginTransactionAsync();

            try
            {
                await conn.ExecuteAsync(insertUserSql, new
                {
                    entity.Email,
                    entity.Password,
                    entity.Name,
                    entity.Cpf,
                    entity.Address,
                    entity.Cellphone,
                    entity.AdmissionDate,
                    entity.CreatedAt,
                    entity.Hidden,
                    entity.ManagerId,
                    entity.CoordenatorId,
                    entity.GestorId,
                    EmploymentType = NormalizeEmploymentType(entity.EmploymentType),
                    AccessEnabled = entity.AccessEnabled ?? true
                }, tx);

                var userId = await conn.ExecuteScalarAsync<long>("SELECT LAST_INSERT_ID();", transaction: tx);

                if (entity.Filial.HasValue)
                {
                    await conn.ExecuteAsync(insertUserBranchSql, new { BranchId = entity.Filial, UserId = userId }, tx);
                }

                if (entity.JobpositionId != null && entity.JobpositionId.Any())
                {
                    var roleIds = NormalizeRoleIds(entity.JobpositionId);
                    var roles = roleIds.Select(roleId => new { RoleId = roleId, UserId = userId });

                    if (roleIds.Any())
                    {
                        await conn.ExecuteAsync(insertUserRoleSql, roles, tx);
                    }
                }

                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateAsync(Usuario entity)
        {
            var pwd = "";

            if(!string.IsNullOrWhiteSpace(entity.Password))
            {
                pwd += " password = @Password,";
            }

            var sql = @$"UPDATE users SET
                                email = @Email, 
                               {pwd}
                                name = @Name,
                                cpf = @Cpf,
                                address = @Address, 
                                cellphone = @Cellphone,
                                admission_date = @AdmissionDate, 
                                created_at =  @CreatedAt, 
                                hidden = @Hidden,
                                manager_id = @ManagerId,
                                coordenator_id = @CoordenatorId,
                                gestor_id = @GestorId,
                                employment_type = @EmploymentType

                            WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            await using var tx = await conn.BeginTransactionAsync();

            try
            {
                var updated = await conn.ExecuteAsync(sql, new
                {
                    entity.Id,
                    entity.Email,
                    entity.Password,
                    entity.Name,
                    entity.Cpf,
                    entity.Address,
                    entity.Cellphone,
                    entity.AdmissionDate,
                    entity.CreatedAt,
                    entity.Hidden,
                    entity.ManagerId,
                    entity.CoordenatorId,
                    entity.GestorId,
                    EmploymentType = NormalizeEmploymentType(entity.EmploymentType)
                }, tx) > 0;

                if (!updated)
                {
                    await tx.RollbackAsync();
                    return false;
                }

                const string sqlDeleteJob = "delete from user_roles where user_id = @UserId";
                await conn.ExecuteAsync(sqlDeleteJob, new { UserId = entity.Id }, tx);

                if (entity.JobpositionId != null && entity.JobpositionId.Any())
                {
                    const string sqlInsertJob = @"insert into user_roles (role_id, user_id, created_at, updated_at)
                                                 values (@RoleId, @UserId, now(), now());";

                    var roleIds = NormalizeRoleIds(entity.JobpositionId);
                    var roles = roleIds.Select(roleId => new { RoleId = roleId, UserId = entity.Id });

                    if (roleIds.Any())
                    {
                        await conn.ExecuteAsync(sqlInsertJob, roles, tx);
                    }
                }

                await tx.CommitAsync();
                return true;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateAccessEnabledAsync(int id, bool accessEnabled)
        {
            const string sql = @"UPDATE users
                                    SET access_enabled = @AccessEnabled
                                  WHERE id = @Id";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { Id = id, AccessEnabled = accessEnabled }) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM users WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }

        private static async Task PopulateUserRolesAsync(IDbConnection conn, List<Usuario> users)
        {
            var userIds = users
                .Where(user => user.Id.HasValue)
                .Select(user => user.Id!.Value)
                .Distinct()
                .ToList();

            if (!userIds.Any())
            {
                return;
            }

            const string sql = @"SELECT DISTINCT user_roles.user_id AS UserId,
                                        roles.id AS RoleId,
                                        roles.name AS RoleName
                                   FROM user_roles
                                   INNER JOIN roles ON roles.id = user_roles.role_id
                                  WHERE user_roles.user_id IN @UserIds
                                  ORDER BY roles.name;";

            var roles = await conn.QueryAsync<UsuarioRoleProjection>(sql, new { UserIds = userIds });
            var rolesByUserId = roles
                .GroupBy(role => role.UserId)
                .ToDictionary(group => group.Key, group => group.ToList());

            foreach (var user in users)
            {
                if (!user.Id.HasValue || !rolesByUserId.TryGetValue(user.Id.Value, out var userRoles))
                {
                    user.JobpositionId = new List<int>();
                    user.RoleNames = new List<string>();
                    user.RoleName = null;
                    continue;
                }

                var distinctRoles = userRoles
                    .Where(role => role.RoleId > 0)
                    .GroupBy(role => role.RoleId)
                    .Select(group => group.First())
                    .ToList();

                user.JobpositionId = distinctRoles.Select(role => role.RoleId).ToList();
                user.RoleNames = distinctRoles
                    .Select(role => role.RoleName?.Trim())
                    .Where(roleName => !string.IsNullOrWhiteSpace(roleName))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList()!;
                user.RoleName = string.Join(", ", user.RoleNames);
            }
        }

        private static List<int> NormalizeRoleIds(IEnumerable<int> roleIds)
        {
            return roleIds
                .Where(roleId => roleId > 0)
                .Distinct()
                .ToList();
        }

        private static string? NormalizeEmploymentType(string? employmentType)
        {
            if (string.IsNullOrWhiteSpace(employmentType))
            {
                return null;
            }

            var normalized = employmentType.Trim().ToUpperInvariant();
            var allowedTypes = new HashSet<string>
            {
                "FUNCIONARIO",
                "SEM_REGISTRO",
                "PJ",
                "PARCEIRO",
                "TERCEIRO",
                "CONTADOR",
                "DIRETOR",
                "OUTRO"
            };

            return allowedTypes.Contains(normalized) ? normalized : null;
        }

        private sealed class UsuarioRoleProjection
        {
            public int UserId { get; set; }
            public int RoleId { get; set; }
            public string RoleName { get; set; } = string.Empty;
        }
    }
}
