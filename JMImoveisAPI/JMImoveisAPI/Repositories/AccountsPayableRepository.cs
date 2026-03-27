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

            var sql = @"INSERT INTO accounts_payable
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
                               FROM accounts_payable
                                    {where}
                                    ORDER BY DueDate IS NULL, DueDate ASC, Id DESC
                                    LIMIT @Limit OFFSET @Offset;";

            string sqlTotal = $@"SELECT COUNT(1) FROM accounts_payable {where};";

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
                            FROM accounts_payable
                            {whereBase};";
            using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<AccountsPayableSummaryDto>(sql, p);

        }

        public async Task SettleAsync(long id, SettleAccountsPayableRequest req)
        {
            using var conn = await _context.OpenConnectionAsync();
            using var tx = conn.BeginTransaction();

            var row = await conn.QuerySingleOrDefaultAsync<dynamic>(
                @"SELECT Id, Status, PendingAmount
              FROM accounts_payable
              WHERE Id = @Id",
                new { Id = id }, tx);

            if (row == null) throw new Exception("Título não encontrado.");
            if ((string)row.Status == "PAID") throw new Exception("Este título já está pago.");

            decimal pending = (decimal)row.PendingAmount;
            decimal paidValue = req.PaidValue;

            if (paidValue <= 0) throw new Exception("Valor da baixa inválido.");
            if (paidValue > pending) throw new Exception("Valor da baixa maior que o pendente.");

            decimal newPending = pending - paidValue;
            string newStatus = newPending <= 0 ? "PAID" : "WAITING";

            DateTime? payDateParam = newStatus == "PAID" ? req.PaidDate.Date : (DateTime?)null;

            await conn.ExecuteAsync(
                @"UPDATE accounts_payable
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
                }, tx);

            tx.Commit();
        }
        private static string BuildWhere(
       AccountsPayableQuery q,
       out DynamicParameters p,
       bool includeStatus = true,
       bool includeDueRange = true)
        {
            var dp = new DynamicParameters();
            var clauses = new List<string>();

            // sem deleted_at na sua tabela, então não filtramos

            if (q.UserId.HasValue) { clauses.Add("UserId = @UserId"); dp.Add("UserId", q.UserId.Value); }
            if (q.SaleId.HasValue) { clauses.Add("SaleId = @SaleId"); dp.Add("SaleId", q.SaleId.Value); }

            if (!string.IsNullOrWhiteSpace(q.Category)) { clauses.Add("Category = @Category"); dp.Add("Category", q.Category.Trim()); }

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
            return clauses.Count == 0 ? "" : "WHERE " + string.Join(" AND ", clauses);
        }
    }
}
