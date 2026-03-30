using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class AtosRepository : IAtosRepository
    {
        private readonly DapperContext _context;
        public AtosRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<Atos>> GetAllAsync()
        {
            var sql = "SELECT * FROM atos";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Atos>(sql);
        }

        public async Task<Atos?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM atos WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Atos>(sql, new { id });
        }

        public async Task<int> CreateAsync(Atos entity)
        {
            var sql = "INSERT INTO atos (...) VALUES (...); SELECT LAST_INSERT_ID();";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(Atos entity)
        {
            var sql = "UPDATE atos SET ... WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM atos WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
