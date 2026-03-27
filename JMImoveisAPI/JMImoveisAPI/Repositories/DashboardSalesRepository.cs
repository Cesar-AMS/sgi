using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using static Dapper.SqlMapper;

namespace JMImoveisAPI.Repositories
{
    public class DashboardSalesRepository : IDashboardSalesRepository
    {
        private readonly DapperContext _context;

        public DashboardSalesRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<SalesByEntityDto>> GetByBranchAsync(DateTime monthStart, DateTime monthEnd, CancellationToken ct)
        {
            string sql = @"SELECT s.branch_id AS Id,
                                  b.name  AS Name,
                                  COUNT(*) AS Quantity,
                                  COALESCE(SUM(s.unit_value),0) AS TotalValue
                                FROM jmoficial.sales s
                                LEFT JOIN branches b on s.branch_id = b.id
                                WHERE s.deleted_at IS NULL
                                  AND s.selled_at >= @Start AND s.selled_at < @End
                                  AND s.branch_id IS NOT NULL
                                GROUP BY s.branch_id
                                ORDER BY TotalValue DESC, Quantity DESC";

            await using var conn = await _context.OpenConnectionAsync();
            var rows = await conn.QueryAsync<SalesByEntityDto>(new CommandDefinition(sql, new { Start = monthStart, End = monthEnd }, cancellationToken: ct));
            return rows.ToList();
        }

        public async Task<IReadOnlyList<SalesByEntityDto>> GetByCoordenatorAsync(DateTime monthStart, DateTime monthEnd, CancellationToken ct)
        {
            var sql = @"SELECT  s.coordenator_id              AS Id,
                                u.name                           AS Name,
                                COUNT(*)                      AS Quantity,
                                COALESCE(SUM(s.unit_value),0) AS TotalValue
                            FROM jmoficial.sales s
                            LEFT JOIN jmoficial.users u on s.coordenator_id = u.id 
                            WHERE s.deleted_at IS NULL
	                            AND s.selled_at >= @Start AND s.selled_at < @End
                              AND s.coordenator_id IS NOT NULL
                            GROUP BY s.coordenator_id
                            ORDER BY TotalValue DESC, Quantity DESC";

            await using var conn = await _context.OpenConnectionAsync();
            var rows = await conn.QueryAsync<SalesByEntityDto>(new CommandDefinition(sql, new { Start = monthStart, End = monthEnd }, cancellationToken: ct));
            return rows.ToList();
        }

        public async Task<IReadOnlyList<SalesByEntityDto>> GetByManagerAsync(DateTime monthStart, DateTime monthEnd, CancellationToken ct)
        {
            var sql = @"SELECT s.manager_id AS Id,
                                u.name      AS Name,
                                COUNT(*)    AS Quantity,
                                COALESCE(SUM(s.unit_value),0) AS TotalValue
                            FROM jmoficial.sales s
                            LEFT JOIN jmoficial.users u on s.manager_id = u.id 
                            WHERE s.deleted_at IS NULL
                              AND s.selled_at >= @Start AND s.selled_at < @End
                              AND s.manager_id IS NOT NULL
                            GROUP BY s.manager_id
                            ORDER BY TotalValue DESC, Quantity DESC";

            await using var conn = await _context.OpenConnectionAsync();
            var rows = await conn.QueryAsync<SalesByEntityDto>(new CommandDefinition(sql, new { Start = monthStart, End = monthEnd }, cancellationToken: ct));
            return rows.ToList();
        }

        public async Task<IReadOnlyList<SalesByMonthDto>> GetByMonthAsync(DateTime yearStart, DateTime yearEnd, CancellationToken ct)
        {
            var sql = @"SELECT MONTH(s.selled_at)           AS Month,
                               COUNT(*)                      AS Quantity,
                               COALESCE(SUM(s.unit_value),0) AS TotalValue
                            FROM jmoficial.sales s
                        WHERE s.deleted_at IS NULL
                              AND s.selled_at >= @Start AND s.selled_at < @End
                            -- opcional: AND s.status NOT IN ('cancelled','void')
                            GROUP BY MONTH(s.selled_at)
                            ORDER BY Month;";

            await using var conn = await _context.OpenConnectionAsync();
            var rows = await conn.QueryAsync<SalesByMonthDto>(new CommandDefinition(sql, new { Start = yearStart, End = yearEnd }, cancellationToken: ct));
            return rows.ToList();
        }

        public async Task<IReadOnlyList<SalesByEntityDto>> GetByRealtorAsync(DateTime monthStart, DateTime monthEnd, CancellationToken ct)
        {
            var sql = @"SELECT s.realtor_id  AS Id,
                                u.name       AS Name,    
                                COUNT(*)     AS Quantity,
                                COALESCE(SUM(s.unit_value),0) AS TotalValue
                            FROM jmoficial.sales s
                            LEFT JOIN jmoficial.users u on s.realtor_id = u.id 
                            WHERE s.deleted_at IS NULL
                              AND s.selled_at >= @Start AND s.selled_at < @End
                              AND s.realtor_id IS NOT NULL
                            GROUP BY s.realtor_id
                            ORDER BY TotalValue DESC, Quantity DESC";

            await using var conn = await _context.OpenConnectionAsync();
            var rows = await conn.QueryAsync<SalesByEntityDto>(new CommandDefinition(sql, new { Start = monthStart, End = monthEnd }, cancellationToken: ct));
            return rows.ToList();
        }
    }
}
