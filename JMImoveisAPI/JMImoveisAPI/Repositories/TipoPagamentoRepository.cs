using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class TipoPagamentoRepository : ITipoPagamentoRepository
    {
        private readonly DapperContext _context;
        public TipoPagamentoRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<TipoPagamento>> GetAllAsync()
        {
            var sql = "SELECT * FROM tipopagamento";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<TipoPagamento>(sql);
        }

        public async Task<TipoPagamento?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM tipopagamento WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<TipoPagamento>(sql, new { id });
        }

        public async Task<int> CreateAsync(TipoPagamento entity)
        {
            var sql = "INSERT INTO tipopagamento (...) VALUES (...); SELECT LAST_INSERT_ID();";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(TipoPagamento entity)
        {
            var sql = "UPDATE tipopagamento SET ... WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM tipopagamento WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync(); 
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
