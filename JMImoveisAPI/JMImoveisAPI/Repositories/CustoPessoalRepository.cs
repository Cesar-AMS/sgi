using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class CustoPessoalRepository : ICustoPessoalRepository
    {
        private readonly DapperContext _context;
        public CustoPessoalRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<CustoPessoal>> GetAllAsync()
        {
            var sql = "SELECT * FROM custopessoal";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<CustoPessoal>(sql);
        }

        public async Task<CustoPessoal?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM custopessoal WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<CustoPessoal>(sql, new { id });
        }

        public async Task<int> CreateAsync(CustoPessoal entity)
        {
            var sql = "INSERT INTO custopessoal (...) VALUES (...); SELECT LAST_INSERT_ID();";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(CustoPessoal entity)
        {
            var sql = "UPDATE custopessoal SET ... WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM custopessoal WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
