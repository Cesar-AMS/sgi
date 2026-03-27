using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class FormasPagamentoRepository : IFormasPagamentoRepository
    {
        private readonly DapperContext _context;
        public FormasPagamentoRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<PaymentType>> GetAllAsync()
        {
            var sql = "SELECT * FROM payment_types";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<PaymentType>(sql);
        }

        public async Task<PaymentType?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM payment_types WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<PaymentType>(sql, new { id });
        }

        public async Task<int> CreateAsync(PaymentType entity)
        {
            const string sql = @" INSERT INTO payment_types  (name, can_parceling, deleted_at, created_at, updated_at)
                                 VALUES  (@Name, @CanParceling, @DeletedAt, @CreatedAt, @UpdatedAt);";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(PaymentType entity)
        {
            const string sql = @"UPDATE payment_types
                                    SET
                                        name = @Name,
                                        can_parceling = @CanParceling,
                                        deleted_at = @DeletedAt,
                                        updated_at = @UpdatedAt
                                    WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM payment_types WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
