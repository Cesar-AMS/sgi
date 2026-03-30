using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class VisitaRepository : IVisitaRepository
    {
        private readonly DapperContext _context;
        public VisitaRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<Visita>> GetAllAsync()
        {
            var sql = "SELECT * FROM visita";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Visita>(sql);
        }

        public async Task<Visita?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM visita WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Visita>(sql, new { id });
        }
    }
}
