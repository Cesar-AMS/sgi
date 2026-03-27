using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class DesistenciaRepository : IDesistenciaRepository
    {
        private readonly DapperContext _context;
        public DesistenciaRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<Desistencia>> GetAllAsync()
        {
            var sql = "SELECT * FROM desistencia";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Desistencia>(sql);
        }

        public async Task<Desistencia?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM desistencia WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Desistencia>(sql, new { id });
        }

        public async Task<int> CreateAsync(Desistencia entity)
        {
            var sql = "INSERT INTO desistencia (...) VALUES (...); SELECT LAST_INSERT_ID();";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(Desistencia entity)
        {
            var sql = "UPDATE desistencia SET ... WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM desistencia WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
