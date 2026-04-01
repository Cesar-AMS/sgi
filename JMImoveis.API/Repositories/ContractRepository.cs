using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class ContractRepository : IContractRepository
    {
        private readonly DapperContext _context;

        public ContractRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<Contract?> GetBySaleIdAsync(int saleId)
        {
            await using var conn = await _context.OpenConnectionAsync();
            await EnsureTableAsync(conn);

            const string sql = @"
                SELECT id,
                       sale_id,
                       number,
                       path,
                       status,
                       observations,
                       created_at,
                       updated_at
                  FROM contracts
                 WHERE sale_id = @saleId
                 LIMIT 1;";

            return await conn.QueryFirstOrDefaultAsync<Contract>(sql, new { saleId });
        }

        public async Task<Contract> CreateAsync(Contract entity)
        {
            await using var conn = await _context.OpenConnectionAsync();
            await EnsureTableAsync(conn);

            const string sql = @"
                INSERT INTO contracts
                    (sale_id, number, path, status, observations, created_at, updated_at)
                VALUES
                    (@SaleId, @Number, @Path, @Status, @Observations, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    id = LAST_INSERT_ID(id),
                    number = VALUES(number),
                    path = VALUES(path),
                    status = VALUES(status),
                    observations = VALUES(observations),
                    updated_at = NOW();

                SELECT LAST_INSERT_ID();";

            await conn.ExecuteScalarAsync<int>(sql, entity);

            var saved = await GetBySaleIdAsync(entity.SaleId);
            if (saved == null)
            {
                throw new InvalidOperationException("Nao foi possivel persistir o contrato.");
            }

            return saved;
        }

        public async Task<bool> UpdateAsync(Contract entity)
        {
            await using var conn = await _context.OpenConnectionAsync();
            await EnsureTableAsync(conn);

            const string sql = @"
                UPDATE contracts
                   SET number = @Number,
                       path = @Path,
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
                CREATE TABLE IF NOT EXISTS contracts (
                    id INT NOT NULL AUTO_INCREMENT,
                    sale_id INT NOT NULL,
                    number VARCHAR(255) NOT NULL DEFAULT '',
                    path TEXT NOT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
                    observations TEXT NOT NULL,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    UNIQUE KEY uk_contract_sale_id (sale_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

            return conn.ExecuteAsync(sql);
        }
    }
}
