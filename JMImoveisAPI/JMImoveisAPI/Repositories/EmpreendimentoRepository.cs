using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class EmpreendimentoRepository : IEmpreendimentoRepository
    {
        private readonly DapperContext _ctx;
        public EmpreendimentoRepository(DapperContext ctx) => _ctx = ctx;

        public async Task<int> CreateAsync(Enterprise entity)
        {
            const string ins = @"INSERT INTO enterprises (name, address, constructor_id, hidden, created_at, updated_at)
                                 VALUES (@Name, @Address, @ConstructorId, @Hidden, UTC_TIMESTAMP(), UTC_TIMESTAMP());
                                 SELECT LAST_INSERT_ID();";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.ExecuteScalarAsync<int>(ins, entity);
        }

        public async Task<IEnumerable<UnitsEnterprise>> GetAllUnitsByEnterprise(int enterpriseId)
        {
            string sql = @$"SELECT T0.id as ""Id"",
                                   T0.block  as ""Block"", 
                                   T0.floor  as ""Floor"", 
                                   T0.`number` as ""Number"", 
                                   T0.value as ""Value"",
                                   T0.`size` as ""Size"", 
                                   T0.dormitories as ""Dormitories"",
                                   0 AS ""Commission"",
                                   T0.active as ""Active""
                                 FROM units T0 
                                 WHERE T0.enterprise_id = {enterpriseId};";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<UnitsEnterprise>(sql);

        }
        public async Task<IEnumerable<UnitsEnterprise>> GetAllUnitsActivesByEnterprise(int enterpriseId)
        {
            string sql = @$"SELECT T0.id as ""Id"",
                                   T0.block  as ""Block"", 
                                   T0.floor  as ""Floor"", 
                                   T0.`number` as ""Number"", 
                                   T0.value as ""Value"",
                                   T0.`size` as ""Size"", 
                                   T0.dormitories as ""Dormitories"",
                                   T0.active as ""Active""
                                FROM units T0 
                                WHERE T0.status = 'OPEN' AND T0.enterprise_id = {enterpriseId} AND T0.active = 1;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<UnitsEnterprise>(sql);

        }

        public async Task<IEnumerable<Enterprise>> GetAllAsync()
        {
            const string sql = @"SELECT T0.id, T0.name, T0.address, T1.name AS ""Constructor"" , T0.created_at 
                                    FROM enterprises T0 
                                    INNER JOIN constructors T1 ON T0.constructor_id = T1.id 
                                    WHERE T0.hidden = 0;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<Enterprise>(sql);
        }

        public async Task<Enterprise?> GetByIdAsync(int id)
        {
            const string sql = @"SELECT id, name, address, constructor_id, created_at, updated_at, deleted_at, hidden
                                FROM enterprises
                                WHERE id = @id;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QuerySingleOrDefaultAsync<Enterprise>(sql, new { id });
        }

        public async Task<IEnumerable<Enterprise?>> GetConstructorAsync()
        {
            string sql = @$"select id , name from jm.constructors c;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<Enterprise>(sql);
        }

        public async Task<IEnumerable<Enterprise?>> GetEnterpriseByConstructorAsync(int id)
        {
            string sql = @$"select id, name  from jm.enterprises t0 where t0.constructor_id ={id};";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<Enterprise>(sql, new { id });
        }

        public async Task<bool> HardDeleteAsync(int id)
        {
            const string del = @"DELETE FROM enterprises WHERE id = @id;";
            await using var con = await _ctx.OpenConnectionAsync();
            var rows = await con.ExecuteAsync(del, new { id });
            return rows > 0;
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            const string del = @"UPDATE enterprises
                                 SET deleted_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP()
                                 WHERE id = @id AND deleted_at IS NULL;";

            await using var con = await _ctx.OpenConnectionAsync();
            var rows = await con.ExecuteAsync(del, new { id });
            return rows > 0;
        }

        public async Task<bool> UpdateAsync(int id, Enterprise entity)
        {
            const string upd = @"UPDATE enterprises
                                 SET name = @Name,
                                     address = @Address,
                                     constructor_id = @ConstructorId,
                                     hidden = @Hidden,
                                     updated_at = UTC_TIMESTAMP()
                                 WHERE id = @Id;";

            entity.Id = id;
            await using var con = await _ctx.OpenConnectionAsync();
            var rows = await con.ExecuteAsync(upd, entity);
            return rows > 0;
        }
    }
}
