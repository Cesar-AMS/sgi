using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class ParcelaRepository : IParcelaRepository
    {
        private readonly DapperContext _context;
        public ParcelaRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<Parcela>> GetAllAsync()
        {
            var sql = "SELECT * FROM parcela";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Parcela>(sql);
        }

        public async Task<Parcela?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM parcela WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Parcela>(sql, new { id });
        }
    }
}
