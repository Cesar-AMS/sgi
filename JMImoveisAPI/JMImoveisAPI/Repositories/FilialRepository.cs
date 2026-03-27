using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class FilialRepository : IFilialRepository
    {
        private readonly DapperContext _context;
        public FilialRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<Filial>> GetAllAsync()
        {
            var sql = "select * from branches where deleted_at is NULL;";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Filial>(sql);
        }

        public async Task<Filial?> GetByIdAsync(int id)
        {
            var sql = "select * from branches WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Filial>(sql, new { id });
        }

        public async Task CreateAsync(Filial entity)
        {
            var sql = @"INSERT INTO branches(name, address, created_at, updated_at)
                VALUES (@Name, @Address, now(), now());";

            await using var conn = await _context.OpenConnectionAsync();

            await conn.ExecuteAsync(sql, entity);
        }

        public async Task<bool> UpdateAsync(Filial entity)
        {
            var sql = @"UPDATE branches 
                SET name = @Name, 
                    address = @Address 
                WHERE id = @Id";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM branches WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
