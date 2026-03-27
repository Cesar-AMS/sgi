using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class NotificacaoRepository : INotificacaoRepository
    {
        private readonly DapperContext _context;
        public NotificacaoRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<Notificacao>> GetAllAsync()
        {
            var sql = "SELECT * FROM notificacao";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Notificacao>(sql);
        }

        public async Task<Notificacao?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM notificacao WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Notificacao>(sql, new { id });
        }

        public async Task<int> CreateAsync(Notificacao entity)
        {
            var sql = "INSERT INTO notificacao (...) VALUES (...); SELECT LAST_INSERT_ID();";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(Notificacao entity)
        {
            var sql = "UPDATE notificacao SET ... WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM notificacao WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
