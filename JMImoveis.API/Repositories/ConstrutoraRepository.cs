using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class ConstrutoraRepository : IConstrutoraRepository
    {
        private readonly DapperContext _ctx;
        public ConstrutoraRepository(DapperContext ctx) => _ctx = ctx;

        public async Task<int> CreateAsync(string name)
        {
            const string ins = @"INSERT INTO constructors (name, created_at, updated_at)
                                 VALUES (@name, UTC_TIMESTAMP(), UTC_TIMESTAMP());";

            const string lastId = "SELECT LAST_INSERT_ID();";

            await using var con = await _ctx.OpenConnectionAsync();
            await con.ExecuteAsync(ins, new { name });
            var id = await con.ExecuteScalarAsync<int>(lastId);
            return id;
        }

        public async Task<IEnumerable<Constructor>> GetAllAsync(bool includeDeleted = false)
        {
            const string sql = @"SELECT id, name, 
                                    (SELECT COUNT(1) FROM jmoficial.enterprises T0 WHERE T0.constructor_id = T1.id) AS ""empreendimentos"",
                                    (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id ) AS ""unidades"",
                                    (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'SELL') AS ""vendidos"",
                                     (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'RESERVED') AS ""reservados"",
                                     (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'OPEN') AS ""disponiveis"",
                                      created_at as ""CreatedAt"", updated_at as ""UpdateAt"" , deleted_at 

                                    FROM jmoficial.constructors T1;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<Constructor>(sql);
        }

        public async Task<Constructor?> GetByIdAsync(int id)
        {
            const string sql = @"SELECT id, name, 
                                    (SELECT COUNT(1) FROM jmoficial.enterprises T0 WHERE T0.constructor_id = T1.id) AS ""empreendimentos"",
                                    (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id ) AS ""unidades"",
                                    (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'SELL') AS ""vendidos"",
                                     (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'RESERVED') AS ""reservados"",
                                     (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'OPEN') AS ""disponiveis"",
                                      created_at , updated_at , deleted_at 

                                    FROM jmoficial.constructors T1                                     
                                    WHERE T1.id = @id;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QuerySingleOrDefaultAsync<Constructor>(sql, new { id });
        }

        public Task<bool> HardDeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            const string del = @"UPDATE jmoficial.constructors
                                    SET deleted_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP()
                                    WHERE id = @id AND deleted_at IS NULL;";

            await using var con = await _ctx.OpenConnectionAsync();
            var rows = await con.ExecuteAsync(del, new { id });
            return rows > 0;
        }

        public async Task<bool> UpdateAsync(int id, string name)
        {
            const string upd = @"UPDATE jmoficial.constructors
                                SET name = @name, updated_at = UTC_TIMESTAMP()
                                WHERE id = @id AND deleted_at IS NULL;";

            await using var con = await _ctx.OpenConnectionAsync();
            var rows = await con.ExecuteAsync(upd, new { id, name });
            return rows > 0;
        }
    }
}
