using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class FormaPagamentoRepository : IFormaPagamentoRepository
    {
        private readonly DapperContext _context;
        public FormaPagamentoRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<FormaPagamento>> GetAllAsync()
        {
            var sql = "SELECT * FROM formapagamento";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<FormaPagamento>(sql);
        }

        public async Task<FormaPagamento?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM formapagamento WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<FormaPagamento>(sql, new { id });
        }
    }
}
