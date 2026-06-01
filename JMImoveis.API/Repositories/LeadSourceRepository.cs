using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class LeadSourceRepository : ILeadSourceRepository
    {
        private readonly DapperContext _context;

        public LeadSourceRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeadSource>> ListAsync()
        {
            const string sql = @"
                SELECT id AS Id,
                       name AS Name,
                       is_active AS IsActive,
                       sort_order AS SortOrder,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM lead_sources
                 ORDER BY is_active DESC, sort_order ASC, name ASC, id ASC;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<LeadSource>(sql);
        }

        public async Task<IEnumerable<LeadSource>> ListActiveAsync()
        {
            const string sql = @"
                SELECT id AS Id,
                       name AS Name,
                       is_active AS IsActive,
                       sort_order AS SortOrder,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM lead_sources
                 WHERE is_active = 1
                 ORDER BY sort_order ASC, name ASC, id ASC;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<LeadSource>(sql);
        }

        public async Task<LeadSource?> GetByIdAsync(int id)
        {
            const string sql = @"
                SELECT id AS Id,
                       name AS Name,
                       is_active AS IsActive,
                       sort_order AS SortOrder,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM lead_sources
                 WHERE id = @Id
                 LIMIT 1;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<LeadSource>(sql, new { Id = id });
        }

        public async Task<bool> ExistsByNameAsync(string name, int? exceptId = null)
        {
            var sql = "SELECT COUNT(1) FROM lead_sources WHERE name = @Name";
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

        public async Task<int> CreateAsync(LeadSource source)
        {
            const string sql = @"
                INSERT INTO lead_sources
                    (name, is_active, sort_order, created_at)
                VALUES
                    (@Name, @IsActive, @SortOrder, NOW());
                SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, source);
        }

        public async Task<bool> UpdateAsync(LeadSource source)
        {
            const string sql = @"
                UPDATE lead_sources
                   SET name = @Name,
                       is_active = @IsActive,
                       sort_order = @SortOrder,
                       updated_at = NOW()
                 WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, source) > 0;
        }

        public async Task<bool> ToggleAsync(int id, bool isActive)
        {
            const string sql = @"
                UPDATE lead_sources
                   SET is_active = @IsActive,
                       updated_at = NOW()
                 WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { Id = id, IsActive = isActive }) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string sql = @"
                UPDATE lead_sources
                   SET is_active = 0,
                       updated_at = NOW()
                 WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { Id = id }) > 0;
        }
    }
}
