using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using System.Text;

namespace JMImoveisAPI.Repositories
{
    public class VisitasRepository : IVisitasRepository
    {
        private readonly DapperContext _context;
        public VisitasRepository(DapperContext context) => _context = context;

        private static string OrderBy(string? sortBy, string? sortDir)
        {
            var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["CustomerName"] = "v.customer_name",
                ["Date"] = "v.`date`",
                ["Origin"] = "v.source_description",
                ["HasSell"] = "v.has_sell"
            };
            var col = (sortBy != null && map.ContainsKey(sortBy)) ? map[sortBy] : "v.`date`";
            var dir = string.Equals(sortDir, "asc", StringComparison.OrdinalIgnoreCase) ? "ASC" : "DESC";
            return $"{col} {dir}";
        }

        public async Task<(IEnumerable<Visitas> Items, int Total)> ListAsync(VisitationsQuery q)
        {
            var sbWhere = new StringBuilder(" WHERE v.deleted_at IS NULL ");
            var p = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(q.Q))
            {
                sbWhere.Append(" AND (v.customer_name LIKE @q OR v.customer_cellphone LIKE @q) ");
                p.Add("@q", $"%{q.Q}%");
            }
            if (!string.IsNullOrWhiteSpace(q.Date))
            {
                sbWhere.Append(" AND v.`date` >= @from AND v.`date` <= @to ");
                if (DateTime.TryParse(q.Date, out var d))
                {
                    p.Add("@from", new DateTime(d.Year, d.Month, d.Day, 0, 0, 0));
                    p.Add("@to", new DateTime(d.Year, d.Month, d.Day, 23, 59, 59));
                }
            }
            if (q.RealtorId.HasValue)
            {
                sbWhere.Append(" AND v.realtor_id = @realtorId ");
                p.Add("@realtorId", q.RealtorId.Value);
            }
            if (q.HadSale.HasValue)
            {
                sbWhere.Append(" AND v.has_sell = @hadSell ");
                p.Add("@hadSell", q.HadSale.Value);
            }

            var orderBy = OrderBy(q.SortBy, q.SortDir);
            var skip = (Math.Max(q.Page, 1) - 1) * Math.Max(q.PageSize, 1);
            var take = Math.Max(q.PageSize, 1);

            var sqlList = $@"SELECT v.id                   AS Id,
                                    v.customer_name        AS CustomerName,
                                    NULL                   AS CustomerNumber,
                                    v.realtor_id           AS RealtorId,
                                    r.name                 AS Realtor,
                                    v.`date`               AS `Date`,
                                    v.source_description   AS SourceDescription,
                                    v.has_sell             AS HasSell,
                                    v.observations         AS Observations
                            FROM visitations v
                            LEFT JOIN  users r on v.realtor_id = r.id 
                            {sbWhere}
                            ORDER BY {orderBy}
                            LIMIT @take OFFSET @skip;";

            var sqlCount = $@"SELECT COUNT(1) FROM visitations v
                                {sbWhere};";

            p.Add("@take", take);
            p.Add("@skip", skip);

            await using var conn = await _context.OpenConnectionAsync();

            var items = await conn.QueryAsync<Visitas>(sqlList, p);
            var total = await conn.ExecuteScalarAsync<int>(sqlCount, p);
            return (items, total);

        }

        public async Task<Visitas?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM visitations WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Visitas>(sql, new { id });
        }

        public async Task<int> CreateAsync(Visitas entity)
        {
            const string sql = @"INSERT INTO jm.visitations (customer_name, source_description, realtor_id, `date`, created_at, updated_at, deleted_at, has_sell, observations, customer_cellphone)
                                 VALUES (@CustomerName, @SourceDescription, @RealtorId, @Date, COALESCE(@CreatedAt, NOW()), @UpdatedAt, @DeletedAt, @HasSell, @Observations, @CustomerCellphone);
                                 SELECT LAST_INSERT_ID();";


            await using var conn = await _context.OpenConnectionAsync();
            var id = await conn.ExecuteScalarAsync<int>(sql, new
            {
                entity.CustomerName,
                entity.SourceDescription,
                entity.RealtorId,
                entity.Date,
                entity.CreatedAt,
                entity.UpdatedAt,
                entity.DeletedAt,
                entity.HasSell,
                entity.Observations,
                entity.CustomerCellphone
            });

            return id;
        }

        public async Task<bool> UpdateAsync(Visitas entity)
        {
            const string sql = @"UPDATE visitations SET
                                  customer_name = @CustomerName,
                                  source_description = @SourceDescription,
                                  realtor_id = @RealtorId,
                                  `date` = @Date,
                                  updated_at = COALESCE(@UpdatedAt, NOW()),
                                  has_sell = @HasSell,
                                  observations = @Observations,
                                  customer_cellphone = @CustomerCellphone
                                WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            var rows = await conn.ExecuteAsync(sql, new
            {
                entity.CustomerName,
                entity.SourceDescription,
                entity.RealtorId,
                entity.Date,
                entity.UpdatedAt,
                entity.HasSell,
                entity.Observations,
                entity.CustomerCellphone,
                entity.Id
            });

            return rows > 0;

        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM visitations WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
