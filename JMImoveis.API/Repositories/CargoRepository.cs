using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class CargoRepository : ICargoRepository
    {
        private readonly DapperContext _context;
        public CargoRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<Cargo>> GetAllAsync()
        {
            var sql = "SELECT * FROM roles";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Cargo>(sql);
        }

        public async Task<Cargo?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM roles WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Cargo>(sql, new { id });
        }

        public async Task<int> CreateAsync(Cargo entity)
        {
            var sql = "INSERT INTO roles (name, created_at, updated_at) values(@Name, now(), now()); SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(Cargo entity)
        {
            var sql = @"UPDATE roles
                        SET name = @Name,
                            updated_at = now()
                        WHERE id = @Id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM roles WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
