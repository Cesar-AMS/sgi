using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class PlanoDePgtoRepository : IPlanoDePgtoRepository
    {
        private readonly DapperContext _context;
        public PlanoDePgtoRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<PlanoDePgto>> GetAllAsync()
        {
            var sql = "SELECT * FROM planodepgto";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<PlanoDePgto>(sql);
        }

        public async Task<PlanoDePgto?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM planodepgto WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<PlanoDePgto>(sql, new { id });
        }

        public async Task<int> CreateAsync(PlanoDePgto entity)
        {
            var sql = "INSERT INTO planodepgto (...) VALUES (...); SELECT LAST_INSERT_ID();";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(PlanoDePgto entity)
        {
            var sql = "UPDATE planodepgto SET ... WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM planodepgto WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
