using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class AjudaDeCustoRepository : IAjudaDeCustoRepository
    {
        private readonly DapperContext _context;
        public AjudaDeCustoRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<AjudaDeCusto>> GetAllAsync()
        {
            var sql = "SELECT * FROM ajudadecusto";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<AjudaDeCusto>(sql);
        }

        public async Task<AjudaDeCusto?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM ajudadecusto WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<AjudaDeCusto>(sql, new { id });
        }

        public async Task<int> CreateAsync(AjudaDeCusto entity)
        {
            var sql = "INSERT INTO ajudadecusto (...) VALUES (...); SELECT LAST_INSERT_ID();";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(AjudaDeCusto entity)
        {
            var sql = "UPDATE ajudadecusto SET ... WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM ajudadecusto WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
