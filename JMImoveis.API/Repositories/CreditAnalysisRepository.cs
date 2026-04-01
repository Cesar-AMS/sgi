using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class CreditAnalysisRepository : ICreditAnalysisRepository
    {
        private readonly DapperContext _context;

        public CreditAnalysisRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<CreditAnalysis?> GetBySaleIdAsync(int saleId)
        {
            await using var conn = await _context.OpenConnectionAsync();
            await EnsureTableAsync(conn);

            const string sql = @"
                SELECT id,
                       sale_id,
                       customer_id,
                       status,
                       summary,
                       restrictions,
                       observations,
                       analyst_user_id,
                       analyst_name,
                       created_at,
                       updated_at
                  FROM credit_analysis
                 WHERE sale_id = @saleId
                 LIMIT 1;";

            return await conn.QueryFirstOrDefaultAsync<CreditAnalysis>(sql, new { saleId });
        }

        public async Task<CreditAnalysis> CreateAsync(CreditAnalysis entity)
        {
            await using var conn = await _context.OpenConnectionAsync();
            await EnsureTableAsync(conn);

            const string sql = @"
                INSERT INTO credit_analysis
                    (sale_id, customer_id, status, summary, restrictions, observations, analyst_user_id, analyst_name, created_at, updated_at)
                VALUES
                    (@SaleId, @CustomerId, @Status, @Summary, @Restrictions, @Observations, @AnalystUserId, @AnalystName, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    id = LAST_INSERT_ID(id),
                    customer_id = VALUES(customer_id),
                    status = VALUES(status),
                    summary = VALUES(summary),
                    restrictions = VALUES(restrictions),
                    observations = VALUES(observations),
                    analyst_user_id = VALUES(analyst_user_id),
                    analyst_name = VALUES(analyst_name),
                    updated_at = NOW();

                SELECT LAST_INSERT_ID();";

            await conn.ExecuteScalarAsync<int>(sql, entity);

            var saved = await GetBySaleIdAsync(entity.SaleId);
            if (saved == null)
            {
                throw new InvalidOperationException("Nao foi possivel persistir a analise de credito.");
            }

            return saved;
        }

        public async Task<bool> UpdateAsync(CreditAnalysis entity)
        {
            await using var conn = await _context.OpenConnectionAsync();
            await EnsureTableAsync(conn);

            const string sql = @"
                UPDATE credit_analysis
                   SET customer_id = @CustomerId,
                       status = @Status,
                       summary = @Summary,
                       restrictions = @Restrictions,
                       observations = @Observations,
                       analyst_user_id = @AnalystUserId,
                       analyst_name = @AnalystName,
                       updated_at = NOW()
                 WHERE id = @Id;";

            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        private static Task EnsureTableAsync(System.Data.Common.DbConnection conn)
        {
            const string sql = @"
                CREATE TABLE IF NOT EXISTS credit_analysis (
                    id INT NOT NULL AUTO_INCREMENT,
                    sale_id INT NOT NULL,
                    customer_id INT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
                    summary TEXT NOT NULL,
                    restrictions TEXT NOT NULL,
                    observations TEXT NOT NULL,
                    analyst_user_id INT NULL,
                    analyst_name VARCHAR(255) NOT NULL DEFAULT '',
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    UNIQUE KEY uk_credit_analysis_sale_id (sale_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

            return conn.ExecuteAsync(sql);
        }
    }
}
