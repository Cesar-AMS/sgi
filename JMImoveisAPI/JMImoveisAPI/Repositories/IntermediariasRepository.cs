using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class IntermediariasRepository : IIntermediariasRepository
    {
        private readonly DapperContext _context;
        public IntermediariasRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<Intermediarias>> GetAllAsync()
        {
            var sql = "SELECT * FROM intermediarias";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Intermediarias>(sql);
        }

        public async Task<Intermediarias?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM intermediarias WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Intermediarias>(sql, new { id });
        }

        public async Task<int> CreateAsync(Intermediarias entity)
        {
            var sql = "INSERT INTO intermediarias (...) VALUES (...); SELECT LAST_INSERT_ID();";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(Intermediarias entity)
        {
            var sql = "UPDATE intermediarias SET ... WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM intermediarias WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
