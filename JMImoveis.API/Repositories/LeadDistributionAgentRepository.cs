using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class LeadDistributionAgentRepository : ILeadDistributionAgentRepository
    {
        private readonly DapperContext _context;

        public LeadDistributionAgentRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeadDistributionAgent>> ListAsync()
        {
            const string sql = @"
                SELECT lda.id AS Id,
                       lda.user_id AS UserId,
                       u.name AS UserName,
                       lda.is_active AS IsActive,
                       lda.level AS Level,
                       lda.priority AS Priority,
                       lda.max_daily_leads AS MaxDailyLeads,
                       lda.last_assigned_at AS LastAssignedAt,
                       lda.created_at AS CreatedAt,
                       lda.updated_at AS UpdatedAt
                  FROM lead_distribution_agents lda
                  LEFT JOIN users u
                    ON u.id = lda.user_id
                 ORDER BY lda.is_active DESC, lda.level, lda.priority, u.name, lda.id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<LeadDistributionAgent>(sql);
        }

        public async Task<LeadDistributionAgent?> GetByIdAsync(long id)
        {
            const string sql = @"
                SELECT lda.id AS Id,
                       lda.user_id AS UserId,
                       u.name AS UserName,
                       lda.is_active AS IsActive,
                       lda.level AS Level,
                       lda.priority AS Priority,
                       lda.max_daily_leads AS MaxDailyLeads,
                       lda.last_assigned_at AS LastAssignedAt,
                       lda.created_at AS CreatedAt,
                       lda.updated_at AS UpdatedAt
                  FROM lead_distribution_agents lda
                  LEFT JOIN users u
                    ON u.id = lda.user_id
                 WHERE lda.id = @Id
                 LIMIT 1;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<LeadDistributionAgent>(sql, new { Id = id });
        }

        public async Task<bool> UserExistsAsync(long userId)
        {
            const string sql = "SELECT COUNT(1) FROM users WHERE id = @UserId;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, new { UserId = userId }) > 0;
        }

        public async Task<bool> ExistsByUserIdAsync(long userId, long? exceptId = null)
        {
            var sql = "SELECT COUNT(1) FROM lead_distribution_agents WHERE user_id = @UserId";
            var parameters = new DynamicParameters();
            parameters.Add("UserId", userId);

            if (exceptId.HasValue && exceptId.Value > 0)
            {
                sql += " AND id <> @ExceptId";
                parameters.Add("ExceptId", exceptId.Value);
            }

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, parameters) > 0;
        }

        public async Task<long> CreateAsync(LeadDistributionAgent agent)
        {
            const string sql = @"
                INSERT INTO lead_distribution_agents
                    (user_id, is_active, level, priority, max_daily_leads, created_at)
                VALUES
                    (@UserId, @IsActive, @Level, @Priority, @MaxDailyLeads, NOW());
                SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<long>(sql, agent);
        }

        public async Task<bool> UpdateAsync(LeadDistributionAgent agent)
        {
            const string sql = @"
                UPDATE lead_distribution_agents
                   SET is_active = @IsActive,
                       level = @Level,
                       priority = @Priority,
                       max_daily_leads = @MaxDailyLeads,
                       updated_at = NOW()
                 WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, agent) > 0;
        }

        public async Task<bool> ToggleAsync(long id, bool isActive)
        {
            const string sql = @"
                UPDATE lead_distribution_agents
                   SET is_active = @IsActive,
                       updated_at = NOW()
                 WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { Id = id, IsActive = isActive }) > 0;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            const string sql = "DELETE FROM lead_distribution_agents WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { Id = id }) > 0;
        }
    }
}
