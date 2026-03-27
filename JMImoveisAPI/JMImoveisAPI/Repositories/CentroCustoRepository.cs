using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class CentroCustoRepository : ICentroCustoRepository
    {
        private readonly DapperContext _context;
        public CentroCustoRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<CentroCusto>> GetAllAsync()
        {
            var sql = "SELECT * FROM centrocusto";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<CentroCusto>(sql);
        }

        public async Task<CentroCusto?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM centrocusto WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<CentroCusto>(sql, new { id });
        }

        public async Task CreateAsync(CentroCusto entity)
        {
            string sql = @"INSERT INTO centrocusto (name, status)
                                             VALUES (@Name, @Status);";

            await using var conn = await _context.OpenConnectionAsync();
            await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(CentroCusto entity)
        {
            var sql = "UPDATE centrocusto SET ... WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM centrocusto WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
