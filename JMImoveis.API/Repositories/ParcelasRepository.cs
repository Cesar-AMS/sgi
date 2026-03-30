using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class ParcelasRepository : IParcelasRepository
    {
        private readonly DapperContext _context;
        public ParcelasRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<Parcelas>> GetAllAsync()
        {
            var sql = "SELECT * FROM parcelas";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Parcelas>(sql);
        }

        public async Task<Parcelas?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM parcelas WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Parcelas>(sql, new { id });
        }

        public async Task<int> CreateAsync(Parcelas entity)
        {
            var sql = "INSERT INTO parcelas (...) VALUES (...); SELECT LAST_INSERT_ID();";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(Parcelas entity)
        {
            var sql = "UPDATE parcelas SET ... WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM parcelas WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
