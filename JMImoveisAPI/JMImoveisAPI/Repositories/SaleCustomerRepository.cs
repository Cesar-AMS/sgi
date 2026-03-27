using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using System.Data;

namespace JMImoveisAPI.Repositories
{
    public class SaleCustomerRepository : ISaleCustomerRepository
    {
        private readonly DapperContext _context;
        public SaleCustomerRepository(DapperContext context) => _context = context;

        public async Task InsertAsync(int saleId, IEnumerable<int> customerIds, IDbTransaction transaction)
        {
            if (customerIds == null) return;

            var sql = @"INSERT INTO sale_customers (sale_id, customer_id, created_at, updated_at)
                        VALUES  (@SaleId, @CustomerId, NOW(), NOW());";


            await using var conn = await _context.OpenConnectionAsync();

            foreach (var customerId in customerIds.Distinct())
            {
                await conn.ExecuteAsync(sql, new
                {
                    SaleId = saleId,
                    CustomerId = customerId
                });
            }

        }
    }
}
