using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class AccountsReceivableRepository : IAccountsReceivableRepository
    {
        private readonly DapperContext _context;

        public AccountsReceivableRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<int> CreateAsync(CreateAccountsReceivableRequest req)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var sql = @"INSERT INTO jmoficial.accounts_receivable
                          (SaleId, BranchId, CreateDate, DueDate, PayDate,
                           description, status, category, Amount, PendingAmount, observations,
                           CreatedAt, UpdatedAt)
                        VALUES
                          (@SaleId, @BranchId, @CompetenceDate, @DueDate, @PaidDate,
                           @Description, @Status, @Category, @Amount, @PendingAmount, @Observations,
                           NOW(), NOW());
                        SELECT LAST_INSERT_ID();";

            var id = await conn.ExecuteScalarAsync<int>(sql, new
            {
                req.SaleId,
                req.BranchId,
                req.CompetenceDate,
                req.DueDate,
                req.PaidDate,
                Description = req.Description,
                req.Status,
                Category = req.Category,
                req.Amount,
                req.PendingAmount,
                req.Observations
            });

            return id;
        }

        public async Task<bool> HasAnyBySaleIdAsync(int saleId)
        {
            await using var conn = await _context.OpenConnectionAsync();

            const string sql = @"SELECT COUNT(1)
                                 FROM jmoficial.accounts_receivable
                                 WHERE SaleId = @SaleId
                                   AND status <> 'CANCELLED'
                                   AND deleted_at IS NULL;";

            var count = await conn.ExecuteScalarAsync<int>(sql, new { SaleId = saleId });
            return count > 0;
        }

        public async Task<AccountsReceivableRowDto?> GetByIdAsync(int id)
        {
            await using var conn = await _context.OpenConnectionAsync();

            const string sql = @"SELECT
                                    Id,
                                    SaleId,
                                    BranchId,
                                    CreateDate AS CreatedAt,
                                    DueDate,
                                    PayDate AS PaidDate,
                                    description AS Description,
                                    status AS Status,
                                    category AS Category,
                                    Amount,
                                    PendingAmount,
                                    observations AS Observations
                                FROM jmoficial.accounts_receivable
                                WHERE Id = @Id
                                  AND deleted_at IS NULL;";

            return await conn.QuerySingleOrDefaultAsync<AccountsReceivableRowDto>(sql, new { Id = id });
        }

        public async Task<PagedResult<AccountsReceivableRowDto>> GetPagedAsync(AccountsReceivableQuery q, int page, int pageSize)
        {
            page = page <= 0 ? 1 : page;
            pageSize = pageSize <= 0 ? 50 : pageSize;
            var offset = (page - 1) * pageSize;

            await using var conn = await _context.OpenConnectionAsync();

            var (whereSql, p) = BuildWhere(q);

            var countSql = $@"
            SELECT COUNT(1)
            FROM jmoficial.accounts_receivable ar
            {whereSql};
        ";

            var listSql = $@" SELECT
                                Id,
                                SaleId,
                                BranchId,
                                CreateDate AS CreatedAt,
                                DueDate,
                                PayDate AS PaidDate,
                                description AS Description,
                                status AS Status,
                                category AS Category,
                                Amount,
                                PendingAmount,
                                observations AS Observations
                            FROM jmoficial.accounts_receivable ar
                            {whereSql}
                            ORDER BY ar.DueDate IS NULL, ar.DueDate, ar.Id DESC
                            LIMIT @Take OFFSET @Skip;        ";

            p.Add("Take", pageSize);
            p.Add("Skip", offset);

            var total = await conn.ExecuteScalarAsync<int>(countSql, p);
            var items = (await conn.QueryAsync<AccountsReceivableRowDto>(listSql, p)).ToList();

            return new PagedResult<AccountsReceivableRowDto>
            {
                Total = total,
                Items = items
            };
        }

        public async Task<AccountsReceivableSummaryDto> GetSummaryAsync(AccountsReceivableQuery q)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var (whereSql, p) = BuildWhere(q);

            var today = DateTime.Today;
            var monthStart = new DateTime(today.Year, today.Month, 1);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);

            p.Add("Today", today);
            p.Add("MonthStart", monthStart);
            p.Add("MonthEnd", monthEnd);

            var sql = $@"
            SELECT
              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'PROJECAO') AS ProjectionTotal,
              (SELECT IFNULL(SUM(ar.Amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'PROJECAO') AS ProjectionValue,

              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING') AS OpenTotal,
              (SELECT IFNULL(SUM(ar.Amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING') AS OpenValue,

              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate = @Today) AS DueTodayTotal,
              (SELECT IFNULL(SUM(ar.Amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate = @Today) AS DueTodayValue,

              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate BETWEEN @MonthStart AND @MonthEnd) AS DueMonthTotal,
              (SELECT IFNULL(SUM(ar.Amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate BETWEEN @MonthStart AND @MonthEnd) AS DueMonthValue,

              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate < @Today) AS OverdueTotal,
              (SELECT IFNULL(SUM(ar.Amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate < @Today) AS OverdueValue,

              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'PAID' AND ar.PayDate BETWEEN @MonthStart AND @MonthEnd) AS PaidMonthTotal,
              (SELECT IFNULL(SUM(ar.Amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'PAID' AND ar.PayDate BETWEEN @MonthStart AND @MonthEnd) AS PaidMonthValue
        ";

            var result = await conn.QuerySingleAsync<AccountsReceivableSummaryDto>(sql, p);
            return result;
        }

        public async Task<bool> UpdateAsync(int id, UpdateAccountsReceivableRequest req)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var current = await conn.QuerySingleOrDefaultAsync<AccountsReceivableState>(
                @"SELECT Id, status AS Status
                  FROM jmoficial.accounts_receivable
                  WHERE Id = @Id
                    AND deleted_at IS NULL;",
                new { Id = id });

            if (current == null)
                return false;

            var currentStatus = NormalizeStatus(current.Status);

            if (currentStatus == "PAID")
                throw new InvalidOperationException("Titulo pago nao pode ser editado.");

            if (currentStatus == "CANCELLED")
                throw new InvalidOperationException("Titulo cancelado nao pode ser editado.");

            if (currentStatus != "WAITING" && currentStatus != "PROJECAO")
                throw new InvalidOperationException("Apenas titulos WAITING ou PROJECAO podem ser editados.");

            var affected = await conn.ExecuteAsync(
                @"UPDATE jmoficial.accounts_receivable
                  SET BranchId = @BranchId,
                      CreateDate = @CompetenceDate,
                      DueDate = @DueDate,
                      description = @Description,
                      status = @Status,
                      category = @Category,
                      Amount = @Amount,
                      PendingAmount = @PendingAmount,
                      observations = @Observations,
                      UpdatedAt = NOW()
                  WHERE Id = @Id
                    AND deleted_at IS NULL;",
                new
                {
                    Id = id,
                    req.BranchId,
                    req.CompetenceDate,
                    req.DueDate,
                    Description = req.Description,
                    req.Status,
                    Category = req.Category,
                    req.Amount,
                    req.PendingAmount,
                    req.Observations
                });

            return affected > 0;
        }

        public async Task<bool> CancelAsync(int id, CancelAccountsReceivableRequest req)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var current = await conn.QuerySingleOrDefaultAsync<AccountsReceivableState>(
                @"SELECT Id, status AS Status, observations AS Observations
                  FROM jmoficial.accounts_receivable
                  WHERE Id = @Id
                    AND deleted_at IS NULL;",
                new { Id = id });

            if (current == null)
                return false;

            var currentStatus = NormalizeStatus(current.Status);

            if (currentStatus == "PAID")
                throw new InvalidOperationException("Titulo pago nao pode ser cancelado.");

            if (currentStatus == "CANCELLED")
                throw new InvalidOperationException("Titulo ja esta cancelado.");

            if (currentStatus != "WAITING" && currentStatus != "PROJECAO")
                throw new InvalidOperationException("Apenas titulos WAITING ou PROJECAO podem ser cancelados.");

            var observations = MergeObservations(current.Observations, req?.Observations);

            var affected = await conn.ExecuteAsync(
                @"UPDATE jmoficial.accounts_receivable
                  SET status = 'CANCELLED',
                      PendingAmount = 0,
                      observations = @Observations,
                      UpdatedAt = NOW()
                  WHERE Id = @Id
                    AND deleted_at IS NULL;",
                new
                {
                    Id = id,
                    Observations = observations
                });

            return affected > 0;
        }

        public async Task SettleAsync(int id, SettleAccountsReceivableRequest req)
        {
            await using var conn = await _context.OpenConnectionAsync();

            using var tx = conn.BeginTransaction();

            var ar = await conn.QuerySingleOrDefaultAsync<AccountsReceivableState>(
                @"SELECT Id, Amount, PendingAmount, status AS Status
                  FROM jmoficial.accounts_receivable
                  WHERE Id = @Id
                    AND deleted_at IS NULL
                  FOR UPDATE;",
                new { Id = id },
                tx);

            if (ar == null)
                throw new Exception("Titulo nao encontrado.");

            var currentStatus = NormalizeStatus(ar.Status);

            if (currentStatus == "PAID")
                throw new Exception("Este titulo ja esta pago.");

            if (currentStatus == "CANCELLED")
                throw new Exception("Titulo cancelado nao pode ser baixado.");

            if (currentStatus != "WAITING" && currentStatus != "PROJECAO")
                throw new Exception("Apenas titulos WAITING ou PROJECAO podem ser baixados.");

            decimal paidValue = req.PaidValue;
            if (paidValue <= 0)
                throw new Exception("Valor da baixa invalido.");

            if (paidValue > ar.PendingAmount)
                throw new Exception("Valor da baixa maior que o valor pendente.");

            decimal newPending = ar.PendingAmount - paidValue;
            string newStatus = newPending <= 0 ? "PAID" : "WAITING";

            await conn.ExecuteAsync(
                @"UPDATE jmoficial.accounts_receivable
                  SET PendingAmount = @PendingValue,
                      status = @Status,
                      PayDate = @PaidDate,
                      observations = COALESCE(@Observations, observations),
                      UpdatedAt = NOW()
                  WHERE Id = @Id",
                new
                {
                    PendingValue = newPending,
                    Status = newStatus,
                    PaidDate = newStatus == "PAID" ? req.PaidDate : null,
                    Observations = req.Observations,
                    Id = id
                },
                tx);

            await conn.ExecuteAsync(
                @"INSERT INTO jmoficial.accounts_receivable_settlements
                  (accounts_receivable_id, paid_value, paid_date, observations)
                  VALUES
                  (@Id, @PaidValue, @PaidDate, @Observations)",
                new
                {
                    Id = id,
                    PaidValue = paidValue,
                    PaidDate = req.PaidDate,
                    Observations = req.Observations
                },
                tx);

            tx.Commit();
        }

        private static string MergeObservations(string? current, string? cancellationObservation)
        {
            if (string.IsNullOrWhiteSpace(cancellationObservation))
                return current ?? string.Empty;

            var cancellationText = $"Cancelamento: {cancellationObservation.Trim()}";
            return string.IsNullOrWhiteSpace(current)
                ? cancellationText
                : $"{current.Trim()}\n{cancellationText}";
        }

        private static string NormalizeStatus(string? status)
            => (status ?? string.Empty).Trim().ToUpperInvariant();

        private (string whereSql, DynamicParameters p) BuildWhere(AccountsReceivableQuery q)
        {
            var p = new DynamicParameters();

            var where = "WHERE ar.deleted_at IS NULL";

            if (q.DueFrom.HasValue)
            {
                where += " AND ar.DueDate >= @DueFrom";
                p.Add("DueFrom", q.DueFrom.Value.Date);
            }

            if (q.DueTo.HasValue)
            {
                where += " AND ar.DueDate <= @DueTo";
                p.Add("DueTo", q.DueTo.Value.Date);
            }

            if (q.BranchId.HasValue)
            {
                where += " AND ar.BranchId = @BranchId";
                p.Add("BranchId", q.BranchId.Value);
            }

            if (!string.IsNullOrWhiteSpace(q.Category))
            {
                where += " AND ar.category = @Category";
                p.Add("Category", q.Category.Trim());
            }

            if (!string.IsNullOrWhiteSpace(q.Status))
            {
                where += " AND ar.status = @Status";
                p.Add("Status", q.Status.Trim().ToUpperInvariant());
            }

            if (!string.IsNullOrWhiteSpace(q.Search))
            {
                where += " AND (ar.description LIKE @Search OR ar.observations LIKE @Search OR ar.category LIKE @Search)";
                p.Add("Search", $"%{q.Search.Trim()}%");
            }

            return (where, p);
        }

        private sealed class AccountsReceivableState
        {
            public int Id { get; set; }
            public decimal Amount { get; set; }
            public decimal PendingAmount { get; set; }
            public string Status { get; set; } = string.Empty;
            public string? Observations { get; set; }
        }
    }
}
