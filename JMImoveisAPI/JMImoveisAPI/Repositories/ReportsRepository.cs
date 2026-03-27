using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class ReportsRepository : IReportsRepository
    {
        private readonly DapperContext _context;

        public ReportsRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MonthlyBranchSalesReportV3>> GetMonthlyBranchSalesAsync(int? year = null)
        {
            var sql = @"SELECT  s.branch_id                                       AS BranchId,
                                YEAR(s.selled_at)                                 AS Year,
                                MONTH(s.selled_at)                                AS Month,
                                SUM(s.value_to_realstate)                         AS SalesValue,
                                SUM(
                                    IFNULL(s.realtor_comission, 0) +
                                    IFNULL(s.manager_comission, 0) +
                                    IFNULL(s.coordenator_comission, 0)
                                )                                                 AS TotalCommission,
                                SUM(IFNULL(s.manager_comission, 0))               AS ManagerCommission,
                                SUM(IFNULL(s.coordenator_comission, 0))           AS CoordinatorCommission,
                                SUM(IFNULL(s.realtor_comission, 0))               AS RealtorCommission
                            FROM jmoficial.sales s
                            WHERE s.deleted_at IS NULL
                              AND s.status = 'OPEN'
                              AND (@Year IS NULL OR YEAR(s.selled_at) = @Year)
                            GROUP BY
                                s.branch_id,
                                YEAR(s.selled_at),
                                MONTH(s.selled_at)
                            ORDER BY
                                BranchId, Year, Month;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<MonthlyBranchSalesReportV3>(sql);
        }

        public async Task<IEnumerable<UserCategoryMonthlyPayablesSummaryV3>> GetUserCategoryMonthlyPayablesAsync(int year)
        {
            var sql = @"
                SELECT
                    ap.UserId                                AS UserId,
                    ap.Category                              AS Category,
                    YEAR(ap.DueDate)                         AS Year,
                    MONTH(ap.DueDate)                        AS Month,
                    COUNT(*)                                 AS ItemsCount,
                    SUM(ap.Amount)                           AS TotalAmount,
                    SUM(
                        CASE WHEN ap.Status = 'PAID' 
                             THEN ap.Amount ELSE 0 END
                    )                                        AS PaidAmount,
                    SUM(
                        CASE WHEN ap.Status = 'WAITING' 
                             THEN ap.PendingAmount ELSE 0 END
                    )                                        AS PendingAmount
                FROM jmoficial.accounts_payable ap
                WHERE YEAR(ap.DueDate) = @Year
                GROUP BY
                    ap.UserId,
                    ap.Category,
                    YEAR(ap.DueDate),
                    MONTH(ap.DueDate)
                ORDER BY
                    ap.UserId, ap.Category, Year, Month;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<UserCategoryMonthlyPayablesSummaryV3>(sql);
        }

        public async Task<IEnumerable<UserMonthlyPayablesSummaryV3>> GetUserMonthlyPayablesSummaryAsync(int year)
        {
            var sql = @"
                SELECT
                    ap.UserId                         AS UserId,
                    YEAR(ap.DueDate)                  AS Year,
                    MONTH(ap.DueDate)                 AS Month,

                    -- Tudo que vence no mês
                    SUM(ap.Amount)                    AS TotalAmount,

                    -- Pago no mês (por PayDate)
                    SUM(
                        CASE 
                            WHEN ap.Status = 'PAID'
                             AND YEAR(ap.PayDate) = @Year
                             AND MONTH(ap.PayDate) = MONTH(ap.DueDate)
                            THEN ap.Amount
                            ELSE 0
                        END
                    )                                  AS PaidAmount,

                    -- Tudo que está pendente (WAITING)
                    SUM(
                        CASE 
                            WHEN ap.Status = 'WAITING'
                            THEN ap.PendingAmount
                            ELSE 0
                        END
                    )                                  AS PendingAmount

                FROM jmoficial.accounts_payable ap
                WHERE YEAR(ap.DueDate) = @Year
                GROUP BY
                    ap.UserId,
                    YEAR(ap.DueDate),
                    MONTH(ap.DueDate)
                ORDER BY
                    ap.UserId, Year, Month;";


            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<UserMonthlyPayablesSummaryV3>(sql);
        }

        public async Task<IEnumerable<UserPayableDetailV3>> GetUserPayablesDetailsAsync(long userId, int? year = null)
        {
            var sql = @"
                SELECT
                    ap.Id             AS Id,
                    ap.SaleId         AS SaleId,
                    ap.UserId         AS UserId,
                    ap.Category       AS Category,
                    ap.Description    AS Description,
                    ap.DueDate        AS DueDate,
                    ap.PayDate        AS PayDate,
                    ap.Status         AS Status,
                    ap.Amount         AS Amount,
                    ap.PendingAmount  AS PendingAmount
                FROM jmoficial.accounts_payable ap
                WHERE ap.UserId = @UserId
                  AND (@Year IS NULL OR YEAR(ap.DueDate) = @Year)
                ORDER BY
                    ap.DueDate, ap.Id;";


            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<UserPayableDetailV3>(sql);
        }
    }
}
