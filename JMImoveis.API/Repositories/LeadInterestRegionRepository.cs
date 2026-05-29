using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class LeadInterestRegionRepository : ILeadInterestRegionRepository
    {
        private readonly DapperContext _context;

        public LeadInterestRegionRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeadInterestRegion>> ListAsync()
        {
            const string sql = @"
                SELECT id AS Id,
                       name AS Name,
                       is_active AS IsActive,
                       sort_order AS SortOrder,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM lead_interest_regions
                 ORDER BY is_active DESC, sort_order ASC, name ASC, id ASC;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<LeadInterestRegion>(sql);
        }

        public async Task<IEnumerable<LeadInterestRegion>> ListActiveAsync()
        {
            const string sql = @"
                SELECT id AS Id,
                       name AS Name,
                       is_active AS IsActive,
                       sort_order AS SortOrder,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM lead_interest_regions
                 WHERE is_active = 1
                 ORDER BY sort_order ASC, name ASC, id ASC;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<LeadInterestRegion>(sql);
        }

        public async Task<LeadInterestRegion?> GetByIdAsync(int id)
        {
            const string sql = @"
                SELECT id AS Id,
                       name AS Name,
                       is_active AS IsActive,
                       sort_order AS SortOrder,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM lead_interest_regions
                 WHERE id = @Id
                 LIMIT 1;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<LeadInterestRegion>(sql, new { Id = id });
        }

        public async Task<bool> ExistsByNameAsync(string name, int? exceptId = null)
        {
            var sql = "SELECT COUNT(1) FROM lead_interest_regions WHERE name = @Name";
            var parameters = new DynamicParameters();
            parameters.Add("Name", name);

            if (exceptId.HasValue && exceptId.Value > 0)
            {
                sql += " AND id <> @ExceptId";
                parameters.Add("ExceptId", exceptId.Value);
            }

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, parameters) > 0;
        }

        public async Task<int> CreateAsync(LeadInterestRegion region)
        {
            const string sql = @"
                INSERT INTO lead_interest_regions
                    (name, is_active, sort_order, created_at)
                VALUES
                    (@Name, @IsActive, @SortOrder, NOW());
                SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, region);
        }

        public async Task<bool> UpdateAsync(LeadInterestRegion region)
        {
            const string sql = @"
                UPDATE lead_interest_regions
                   SET name = @Name,
                       is_active = @IsActive,
                       sort_order = @SortOrder,
                       updated_at = NOW()
                 WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, region) > 0;
        }

        public async Task<bool> ToggleAsync(int id, bool isActive)
        {
            const string sql = @"
                UPDATE lead_interest_regions
                   SET is_active = @IsActive,
                       updated_at = NOW()
                 WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { Id = id, IsActive = isActive }) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string sql = @"
                UPDATE lead_interest_regions
                   SET is_active = 0,
                       updated_at = NOW()
                 WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { Id = id }) > 0;
        }
    }
}
