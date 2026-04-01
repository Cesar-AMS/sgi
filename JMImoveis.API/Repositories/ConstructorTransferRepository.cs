using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class ConstructorTransferRepository : IConstructorTransferRepository
    {
        private readonly DapperContext _context;

        public ConstructorTransferRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<ConstructorTransfer?> GetBySaleIdAsync(int saleId)
        {
            await using var conn = await _context.OpenConnectionAsync();
            await EnsureTableAsync(conn);

            const string sql = @"
                SELECT id,
                       sale_id,
                       constructor_id,
                       amount,
                       planned_date,
                       status,
                       observations,
                       created_at,
                       updated_at
                  FROM constructor_transfers
                 WHERE sale_id = @saleId
                 LIMIT 1;";

            return await conn.QueryFirstOrDefaultAsync<ConstructorTransfer>(sql, new { saleId });
        }

        public async Task<ConstructorTransfer> CreateAsync(ConstructorTransfer entity)
        {
            await using var conn = await _context.OpenConnectionAsync();
            await EnsureTableAsync(conn);

            const string sql = @"
                INSERT INTO constructor_transfers
                    (sale_id, constructor_id, amount, planned_date, status, observations, created_at, updated_at)
                VALUES
                    (@SaleId, @ConstructorId, @Amount, @PlannedDate, @Status, @Observations, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    id = LAST_INSERT_ID(id),
                    constructor_id = VALUES(constructor_id),
                    amount = VALUES(amount),
                    planned_date = VALUES(planned_date),
                    status = VALUES(status),
                    observations = VALUES(observations),
                    updated_at = NOW();

                SELECT LAST_INSERT_ID();";

            await conn.ExecuteScalarAsync<int>(sql, entity);

            var saved = await GetBySaleIdAsync(entity.SaleId);
            if (saved == null)
            {
                throw new InvalidOperationException("Nao foi possivel persistir o repasse.");
            }

            return saved;
        }

        public async Task<bool> UpdateAsync(ConstructorTransfer entity)
        {
            await using var conn = await _context.OpenConnectionAsync();
            await EnsureTableAsync(conn);

            const string sql = @"
                UPDATE constructor_transfers
                   SET constructor_id = @ConstructorId,
                       amount = @Amount,
                       planned_date = @PlannedDate,
                       status = @Status,
                       observations = @Observations,
                       updated_at = NOW()
                 WHERE id = @Id
                   AND sale_id = @SaleId;";

            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        private static Task EnsureTableAsync(System.Data.Common.DbConnection conn)
        {
            const string sql = @"
                CREATE TABLE IF NOT EXISTS constructor_transfers (
                    id INT NOT NULL AUTO_INCREMENT,
                    sale_id INT NOT NULL,
                    constructor_id INT NULL,
                    amount DECIMAL(18,2) NOT NULL DEFAULT 0,
                    planned_date DATE NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
                    observations TEXT NOT NULL,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    UNIQUE KEY uk_constructor_transfer_sale_id (sale_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

            return conn.ExecuteAsync(sql);
        }
    }
}
