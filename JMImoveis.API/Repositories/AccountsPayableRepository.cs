using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class AccountsPayableRepository : IAccountsPayableRepository
    {
        private readonly DapperContext _context;
        public AccountsPayableRepository(DapperContext context) => _context = context;

        public async Task<long> CreateAsync(CreateAccountsPayableRequest req)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var sql = @"INSERT INTO jmoficial.accounts_payable
                        (SaleId, UserId, CreateDate, DueDate, PayDate, Description, Status, Amount, PendingAmount, Category, Observations, CreatedAt, UpdatedAt)
                        VALUES
                        (@SaleId, @UserId, @CreateDate, @DueDate, @PayDate, @Description, @Status, @Amount, @PendingAmount, @Category, @Observations, NOW(), NOW());

                        SELECT LAST_INSERT_ID();";

            var id = await conn.ExecuteScalarAsync<long>(sql, new
            {
                req.SaleId,
                req.UserId,
                CreateDate = req.CreateDate,
                DueDate = req.DueDate?.Date,
                PayDate = req.PayDate?.Date,
                Description = req.Description ?? "",
                req.Status,
                Amount = req.Amount,
                req.PendingAmount,
                Category = req.Category ?? "",
                Observations = req.Observations
            });

            return id;
        }

        public async Task<AccountsPayableRowDto?> GetByIdAsync(long id)
        {
            await using var conn = await _context.OpenConnectionAsync();

            const string sql = @"SELECT Id,
                                     SaleId,
                                     UserId,
                                     CreateDate,
                                     DueDate,
                                     PayDate,
                                     Description,
                                     Status,
                                     Amount,
                                     PendingAmount,
                                     Category,
                                     Observations,
                                     CreatedAt,
                                     UpdatedAt
                               FROM jmoficial.accounts_payable
                               WHERE Id = @Id
                                 AND deleted_at IS NULL;";

            return await conn.QuerySingleOrDefaultAsync<AccountsPayableRowDto>(sql, new { Id = id });
        }

        public async Task<(List<AccountsPayableRowDto> Items, int Total)> GetPagedAsync(AccountsPayableQuery q)
        {
            var where = BuildWhere(q, out var p);
            using var conn = await _context.OpenConnectionAsync();
            int offset = (Math.Max(q.Page, 1) - 1) * Math.Max(q.PageSize, 1);

            p.Add("Offset", offset);
            p.Add("Limit", Math.Max(q.PageSize, 1));

            string sqlItems = $@"SELECT Id,
                                     SaleId,
                                     UserId,
                                     CreateDate,
                                     DueDate,
                                     PayDate,
                                     Description,
                                     Status,
                                     Amount,
                                     PendingAmount,
                                     Category,
                                     Observations,
                                     CreatedAt,
                                     UpdatedAt
                               FROM jmoficial.accounts_payable
                                    {where}
                                    ORDER BY DueDate IS NULL, DueDate ASC, Id DESC
                                    LIMIT @Limit OFFSET @Offset;";

            string sqlTotal = $@"SELECT COUNT(1) FROM jmoficial.accounts_payable {where};";

            var items = ((await conn.QueryAsync<AccountsPayableRowDto>(sqlItems, p)).ToList());
            var total = await conn.ExecuteScalarAsync<int>(sqlTotal, p);
            return (items, total);
        }

        public async Task<AccountsPayableSummaryDto> GetSummaryAsync(AccountsPayableQuery q)
        {
            var baseQ = new AccountsPayableQuery
            {
                UserId = q.UserId,
                SaleId = q.SaleId,
                Category = q.Category,
                Search = q.Search
            };

            var whereBase = BuildWhere(baseQ, out var p, includeStatus: false, includeDueRange: false);

            var today = DateTime.Today;
            var monthStart = new DateTime(today.Year, today.Month, 1);
            var monthEnd = new DateTime(today.Year, today.Month, DateTime.DaysInMonth(today.Year, today.Month));

            p.Add("Today", today);
            p.Add("MonthStart", monthStart);
            p.Add("MonthEnd", monthEnd);

            string sql = $@"SELECT
                              SUM(CASE WHEN Status='PROJECAO' THEN 1 ELSE 0 END) AS ProjectionTotal,
                              SUM(CASE WHEN Status='PROJECAO' THEN PendingAmount ELSE 0 END) AS ProjectionValue,

                              SUM(CASE WHEN Status='WAITING' THEN 1 ELSE 0 END) AS OpenTotal,
                              SUM(CASE WHEN Status='WAITING' THEN PendingAmount ELSE 0 END) AS OpenValue,

                              SUM(CASE WHEN Status='WAITING' AND DueDate = @Today THEN 1 ELSE 0 END) AS DueTodayTotal,
                              SUM(CASE WHEN Status='WAITING' AND DueDate = @Today THEN PendingAmount ELSE 0 END) AS DueTodayValue,

                              SUM(CASE WHEN Status='WAITING' AND DueDate BETWEEN @MonthStart AND @MonthEnd THEN 1 ELSE 0 END) AS DueMonthTotal,
                              SUM(CASE WHEN Status='WAITING' AND DueDate BETWEEN @MonthStart AND @MonthEnd THEN PendingAmount ELSE 0 END) AS DueMonthValue,

                              SUM(CASE WHEN Status='WAITING' AND DueDate < @Today THEN 1 ELSE 0 END) AS OverdueTotal,
                              SUM(CASE WHEN Status='WAITING' AND DueDate < @Today THEN PendingAmount ELSE 0 END) AS OverdueValue,

                              SUM(CASE WHEN Status='PAID' AND PayDate BETWEEN @MonthStart AND @MonthEnd THEN 1 ELSE 0 END) AS PaidMonthTotal,
                              SUM(CASE WHEN Status='PAID' AND PayDate BETWEEN @MonthStart AND @MonthEnd THEN Amount ELSE 0 END) AS PaidMonthValue
                            FROM jmoficial.accounts_payable
                            {whereBase};";
            using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<AccountsPayableSummaryDto>(sql, p);
        }

        public async Task<bool> UpdateAsync(long id, UpdateAccountsPayableRequest req)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var current = await conn.QuerySingleOrDefaultAsync<AccountsPayableState>(
                @"SELECT Id, Status
                  FROM jmoficial.accounts_payable
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
                @"UPDATE jmoficial.accounts_payable
                  SET SaleId = @SaleId,
                      UserId = @UserId,
                      CreateDate = @CreateDate,
                      DueDate = @DueDate,
                      Description = @Description,
                      Status = @Status,
                      Amount = @Amount,
                      PendingAmount = @PendingAmount,
                      Category = @Category,
                      Observations = @Observations,
                      UpdatedAt = NOW()
                  WHERE Id = @Id
                    AND deleted_at IS NULL;",
                new
                {
                    Id = id,
                    req.SaleId,
                    req.UserId,
                    req.CreateDate,
                    req.DueDate,
                    Description = req.Description,
                    req.Status,
                    Amount = req.Amount,
                    req.PendingAmount,
                    Category = req.Category,
                    req.Observations
                });

            return affected > 0;
        }

        public async Task<bool> CancelAsync(long id, CancelAccountsPayableRequest req)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var current = await conn.QuerySingleOrDefaultAsync<AccountsPayableState>(
                @"SELECT Id, Status, Observations
                  FROM jmoficial.accounts_payable
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
                @"UPDATE jmoficial.accounts_payable
                  SET Status = 'CANCELLED',
                      PendingAmount = 0,
                      Observations = @Observations,
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

        public async Task SettleAsync(long id, SettleAccountsPayableRequest req)
        {
            using var conn = await _context.OpenConnectionAsync();
            using var tx = conn.BeginTransaction();

            var row = await conn.QuerySingleOrDefaultAsync<AccountsPayableState>(
                @"SELECT Id, Status, PendingAmount
                  FROM jmoficial.accounts_payable
                  WHERE Id = @Id
                    AND deleted_at IS NULL
                  FOR UPDATE;",
                new { Id = id },
                tx);

            if (row == null)
                throw new KeyNotFoundException("Titulo nao encontrado.");

            var currentStatus = NormalizeStatus(row.Status);

            if (currentStatus == "PAID")
                throw new InvalidOperationException("Este titulo ja esta pago.");

            if (currentStatus == "CANCELLED")
                throw new InvalidOperationException("Titulo cancelado nao pode ser pago.");

            if (currentStatus != "WAITING" && currentStatus != "PROJECAO")
                throw new InvalidOperationException("Apenas titulos WAITING ou PROJECAO podem ser pagos.");

            decimal paidValue = req.PaidValue;

            if (paidValue <= 0)
                throw new ArgumentException("Valor do pagamento invalido.");

            if (paidValue > row.PendingAmount)
                throw new ArgumentException("Valor do pagamento maior que o pendente.");

            decimal newPending = row.PendingAmount - paidValue;
            string newStatus = newPending <= 0 ? "PAID" : "WAITING";

            DateTime? payDateParam = newStatus == "PAID" ? req.PaidDate.Date : (DateTime?)null;

            await conn.ExecuteAsync(
                @"UPDATE jmoficial.accounts_payable
                  SET PendingAmount = @PendingAmount,
                      Status = @Status,
                      PayDate = @PayDate,
                      Observations = COALESCE(@Observations, Observations),
                      UpdatedAt = NOW()
                  WHERE Id = @Id",
                new
                {
                    PendingAmount = newPending,
                    Status = newStatus,
                    PayDate = payDateParam,
                    Observations = req.Observations,
                    Id = id
                },
                tx);

            await conn.ExecuteAsync(
                @"INSERT INTO jmoficial.accounts_payable_settlements
                  (accounts_payable_id, paid_value, paid_date, observations)
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

        private static string BuildWhere(
       AccountsPayableQuery q,
       out DynamicParameters p,
       bool includeStatus = true,
       bool includeDueRange = true)
        {
            var dp = new DynamicParameters();
            var clauses = new List<string> { "deleted_at IS NULL" };

            if (q.UserId.HasValue) { clauses.Add("UserId = @UserId"); dp.Add("UserId", q.UserId.Value); }
            if (q.SaleId.HasValue) { clauses.Add("SaleId = @SaleId"); dp.Add("SaleId", q.SaleId.Value); }

            if (!string.IsNullOrWhiteSpace(q.Category))
            {
                var category = q.Category.Trim().ToUpperInvariant();
                if (category == "COMISSAO")
                {
                    // Comissoes oficiais do piloto financeiro sao lancamentos em
                    // accounts_payable com categorias COMISSAO_*.
                    clauses.Add("Category LIKE 'COMISSAO_%'");
                }
                else
                {
                    clauses.Add("Category = @Category");
                    dp.Add("Category", category);
                }
            }

            if (!string.IsNullOrWhiteSpace(q.Search))
            {
                clauses.Add("(Description LIKE @Search OR Observations LIKE @Search)");
                dp.Add("Search", $"%{q.Search.Trim()}%");
            }

            if (includeStatus && !string.IsNullOrWhiteSpace(q.Status))
            {
                clauses.Add("Status = @Status");
                dp.Add("Status", q.Status.Trim().ToUpper());
            }

            if (includeDueRange)
            {
                if (q.DueFrom.HasValue) { clauses.Add("DueDate >= @DueFrom"); dp.Add("DueFrom", q.DueFrom.Value.Date); }
                if (q.DueTo.HasValue) { clauses.Add("DueDate <= @DueTo"); dp.Add("DueTo", q.DueTo.Value.Date); }
            }

            p = dp;
            return "WHERE " + string.Join(" AND ", clauses);
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

        private sealed class AccountsPayableState
        {
            public long Id { get; set; }
            public string Status { get; set; } = string.Empty;
            public decimal PendingAmount { get; set; }
            public string? Observations { get; set; }
        }
    }
}
