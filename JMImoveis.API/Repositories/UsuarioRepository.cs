using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using System.Collections.Generic;
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

            if(status == "active")
            {
                whr += "where hidden = 0";
            }

            if (status == "inactive")
            {
                whr += "where hidden = 1";
            }


            var sql = $"SELECT * FROM users {whr};";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Usuario>(sql);
        }

        public async Task<Usuario?> GetByEmailAsync(string email)
        {
            var sql = "SELECT * FROM users WHERE email = @email";
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
            var and = "";

            if(roleId != 0)
            {
                and += $" and T0.jobpositionId = {roleId}";
            }

            if (status != 2)
            {
                and += $"  and T0.hidden = {status}";
            }

            if(branchId != 0)
            {
                and += $" and T1.branch_id = {branchId}";
            }

            var sql = @$"SELECT DISTINCT T0.* FROM users T0 
                         LEFT JOIN user_branches T1 ON T0.id = T1.user_id 
                         WHERE 1 = 1  
                         {and}";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Usuario>(sql);
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
            var sql = @$"Select *, coordenator_id as ""CoordenatorId"", 
                                   manager_id as ""ManagerId"", 
                                   gestor_id as ""GestorId"" 
                                   from users WHERE id = @id";

            await using var conn = await _context.OpenConnectionAsync();
            var user = await conn.QueryFirstOrDefaultAsync<Usuario>(sql, new { id });

            if (user != null)
            {
                var sqlJob = $"SELECT T0.role_id FROM user_roles T0 where T0.user_id = {id}";
                user.JobpositionId = (await conn.QueryAsync<int>(sqlJob)).ToList();
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
            const string insertUserSql = @"INSERT INTO users  (email, password, name, cpf, address, cellphone, admission_date, created_at, hidden, jobpositionId)
                VALUES  (@Email, @Password, @Name, @Cpf, @Address, @Cellphone, @AdmissionDate, @CreatedAt, @Hidden, @JobpositionId);";

            const string insertUserBranchSql = @"INSERT INTO user_branches (branch_id, user_id, created_at, updated_at)
                                                 VALUES (@BranchId, @UserId, NOW(), NOW());";

            await using var conn = await _context.OpenConnectionAsync();
            await using var tx = await conn.BeginTransactionAsync();

            try
            {
                await conn.ExecuteAsync(insertUserSql, entity, tx);

                var userId = await conn.ExecuteScalarAsync<long>("SELECT LAST_INSERT_ID();", transaction: tx);

                await conn.ExecuteAsync(insertUserBranchSql, new { BranchId = entity.Filial, UserId = userId }, tx);

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

            if(entity.Password != "")
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
                                hidden = @Hidden

                            WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();

            var sqlDeleteJob = $"delete from user_roles T0 where T0.user_id = {entity.Id}";
            await conn.ExecuteAsync(sqlDeleteJob);

            if (entity.JobpositionId != null && entity.JobpositionId.Any())
            {
                var sqlInsert = "";

                foreach (var item in entity.JobpositionId.ToList())
                {
                    sqlInsert += @$"insert into user_roles (role_id, user_id, created_at, updated_at)
                                  values ({item},{entity.Id},now(), now()); ";

                    await conn.ExecuteAsync(sqlInsert);
                }

            }
            

            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM usuario WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
