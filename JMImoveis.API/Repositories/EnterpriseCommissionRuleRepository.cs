using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class EnterpriseCommissionRuleRepository : IEnterpriseCommissionRuleRepository
    {
        private readonly DapperContext _context;

        public EnterpriseCommissionRuleRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EnterpriseCommissionRule>> ListByEnterpriseAsync(long enterpriseId)
        {
            const string sql = @"
                SELECT id AS Id,
                       enterprise_id AS EnterpriseId,
                       rule_type AS RuleType,
                       version AS Version,
                       active AS Active,
                       starts_at AS StartsAt,
                       ends_at AS EndsAt,
                       ato_threshold AS AtoThreshold,
                       payment_day AS PaymentDay,
                       director_enabled AS DirectorEnabled,
                       campaign_name AS CampaignName,
                       notes AS Notes,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM jmoficial.enterprise_commission_rules
                 WHERE enterprise_id = @EnterpriseId
                 ORDER BY rule_type, version DESC, id DESC;";

            await using var conn = await _context.OpenConnectionAsync();
            var rules = (await conn.QueryAsync<EnterpriseCommissionRule>(sql, new { EnterpriseId = enterpriseId })).ToList();
            await LoadItemsAsync(conn, rules);
            return rules;
        }

        public async Task<IEnumerable<EnterpriseCommissionRule>> ListActiveByEnterpriseAsync(long enterpriseId, string? ruleType)
        {
            var sql = @"
                SELECT id AS Id,
                       enterprise_id AS EnterpriseId,
                       rule_type AS RuleType,
                       version AS Version,
                       active AS Active,
                       starts_at AS StartsAt,
                       ends_at AS EndsAt,
                       ato_threshold AS AtoThreshold,
                       payment_day AS PaymentDay,
                       director_enabled AS DirectorEnabled,
                       campaign_name AS CampaignName,
                       notes AS Notes,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM jmoficial.enterprise_commission_rules
                 WHERE enterprise_id = @EnterpriseId
                   AND active = 1
                   AND (@RuleType IS NULL OR rule_type = @RuleType)
                   AND (starts_at IS NULL OR starts_at <= NOW())
                   AND (ends_at IS NULL OR ends_at >= NOW())
                 ORDER BY rule_type, version DESC, id DESC;";

            await using var conn = await _context.OpenConnectionAsync();
            var rules = (await conn.QueryAsync<EnterpriseCommissionRule>(sql, new
            {
                EnterpriseId = enterpriseId,
                RuleType = ruleType
            })).ToList();

            await LoadItemsAsync(conn, rules);
            return rules;
        }

        public async Task<EnterpriseCommissionRule?> GetByIdAsync(long id)
        {
            const string sql = @"
                SELECT id AS Id,
                       enterprise_id AS EnterpriseId,
                       rule_type AS RuleType,
                       version AS Version,
                       active AS Active,
                       starts_at AS StartsAt,
                       ends_at AS EndsAt,
                       ato_threshold AS AtoThreshold,
                       payment_day AS PaymentDay,
                       director_enabled AS DirectorEnabled,
                       campaign_name AS CampaignName,
                       notes AS Notes,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM jmoficial.enterprise_commission_rules
                 WHERE id = @Id
                 LIMIT 1;";

            await using var conn = await _context.OpenConnectionAsync();
            var rule = await conn.QuerySingleOrDefaultAsync<EnterpriseCommissionRule>(sql, new { Id = id });
            if (rule is null)
            {
                return null;
            }

            await LoadItemsAsync(conn, new[] { rule });
            return rule;
        }

        public async Task<int> GetNextVersionAsync(long enterpriseId, string ruleType)
        {
            const string sql = @"
                SELECT COALESCE(MAX(version), 0) + 1
                  FROM jmoficial.enterprise_commission_rules
                 WHERE enterprise_id = @EnterpriseId
                   AND rule_type = @RuleType;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, new { EnterpriseId = enterpriseId, RuleType = ruleType });
        }

        public async Task<long> CreateAsync(EnterpriseCommissionRule rule)
        {
            await using var conn = await _context.OpenConnectionAsync();
            await using var tx = await conn.BeginTransactionAsync();

            const string insertRuleSql = @"
                INSERT INTO jmoficial.enterprise_commission_rules
                    (enterprise_id, rule_type, version, active, starts_at, ends_at,
                     ato_threshold, payment_day, director_enabled, campaign_name, notes,
                     created_at, updated_at)
                VALUES
                    (@EnterpriseId, @RuleType, @Version, @Active, @StartsAt, @EndsAt,
                     @AtoThreshold, @PaymentDay, @DirectorEnabled, @CampaignName, @Notes,
                     NOW(), NULL);
                SELECT LAST_INSERT_ID();";

            var ruleId = await conn.ExecuteScalarAsync<long>(insertRuleSql, rule, tx);
            await InsertItemsAsync(conn, tx, ruleId, rule.Items);
            await tx.CommitAsync();

            return ruleId;
        }

        public async Task<bool> UpdateAsync(EnterpriseCommissionRule rule)
        {
            await using var conn = await _context.OpenConnectionAsync();
            await using var tx = await conn.BeginTransactionAsync();

            const string updateRuleSql = @"
                UPDATE jmoficial.enterprise_commission_rules
                   SET active = @Active,
                       starts_at = @StartsAt,
                       ends_at = @EndsAt,
                       ato_threshold = @AtoThreshold,
                       payment_day = @PaymentDay,
                       director_enabled = @DirectorEnabled,
                       campaign_name = @CampaignName,
                       notes = @Notes,
                       updated_at = NOW()
                 WHERE id = @Id;";

            var updated = await conn.ExecuteAsync(updateRuleSql, rule, tx);
            if (updated == 0)
            {
                await tx.RollbackAsync();
                return false;
            }

            await conn.ExecuteAsync(
                "DELETE FROM jmoficial.enterprise_commission_rule_items WHERE rule_id = @RuleId;",
                new { RuleId = rule.Id },
                tx);

            await InsertItemsAsync(conn, tx, rule.Id, rule.Items);
            await tx.CommitAsync();
            return true;
        }

        public async Task DeactivateActiveByTypeAsync(long enterpriseId, string ruleType, long? exceptId = null)
        {
            const string sql = @"
                UPDATE jmoficial.enterprise_commission_rules
                   SET active = 0,
                       updated_at = NOW()
                 WHERE enterprise_id = @EnterpriseId
                   AND rule_type = @RuleType
                   AND active = 1
                   AND (@ExceptId IS NULL OR id <> @ExceptId);";

            await using var conn = await _context.OpenConnectionAsync();
            await conn.ExecuteAsync(sql, new { EnterpriseId = enterpriseId, RuleType = ruleType, ExceptId = exceptId });
        }

        public async Task<bool> DeactivateAsync(long id)
        {
            const string sql = @"
                UPDATE jmoficial.enterprise_commission_rules
                   SET active = 0,
                       updated_at = NOW()
                 WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { Id = id }) > 0;
        }

        private static async Task LoadItemsAsync(System.Data.Common.DbConnection conn, IReadOnlyCollection<EnterpriseCommissionRule> rules)
        {
            if (rules.Count == 0)
            {
                return;
            }

            const string sql = @"
                SELECT id AS Id,
                       rule_id AS RuleId,
                       role AS Role,
                       percentage AS Percentage,
                       fixed_amount AS FixedAmount,
                       payment_mode AS PaymentMode,
                       payment_day AS PaymentDay,
                       active AS Active,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM jmoficial.enterprise_commission_rule_items
                 WHERE rule_id IN @RuleIds
                 ORDER BY id;";

            var items = (await conn.QueryAsync<EnterpriseCommissionRuleItem>(sql, new
            {
                RuleIds = rules.Select(r => r.Id).ToArray()
            })).ToList();

            var byRule = items.GroupBy(i => i.RuleId).ToDictionary(g => g.Key, g => g.ToList());
            foreach (var rule in rules)
            {
                rule.Items = byRule.TryGetValue(rule.Id, out var ruleItems)
                    ? ruleItems
                    : new List<EnterpriseCommissionRuleItem>();
            }
        }

        private static Task InsertItemsAsync(
            System.Data.Common.DbConnection conn,
            System.Data.Common.DbTransaction tx,
            long ruleId,
            IEnumerable<EnterpriseCommissionRuleItem> items)
        {
            const string sql = @"
                INSERT INTO jmoficial.enterprise_commission_rule_items
                    (rule_id, role, percentage, fixed_amount, payment_mode, payment_day,
                     active, created_at, updated_at)
                VALUES
                    (@RuleId, @Role, @Percentage, @FixedAmount, @PaymentMode, @PaymentDay,
                     @Active, NOW(), NULL);";

            var rows = (items ?? Enumerable.Empty<EnterpriseCommissionRuleItem>())
                .Select(item => new
                {
                    RuleId = ruleId,
                    item.Role,
                    item.Percentage,
                    item.FixedAmount,
                    item.PaymentMode,
                    item.PaymentDay,
                    item.Active
                });

            return conn.ExecuteAsync(sql, rows, tx);
        }
    }
}
