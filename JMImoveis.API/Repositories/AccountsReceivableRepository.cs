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
                Amount = req.Amount,
                req.PendingAmount,
                req.Observations
            });

            return id;

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
                                CreateDate  AS CreatedAt,
                                DueDate,
                                PayDate,
                                Description,
                                Status,
                                Category,
                                Amount,
                                PendingAmount,
                                Observations
                            FROM jmoficial.accounts_receivable ar
                            {whereSql}
                            ORDER BY ar.DueDate IS NULL, ar.DueDate, ar.id DESC
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

            // Base filters (branch/category/status/search/due range) aplicados no summary também
            var (whereSql, p) = BuildWhere(q);

            // Hoje / mês atual
            var today = DateTime.Today;
            var monthStart = new DateTime(today.Year, today.Month, 1);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);

            p.Add("Today", today);
            p.Add("MonthStart", monthStart);
            p.Add("MonthEnd", monthEnd);

            // Observação: aqui usamos SUM(total_value) (como no front você exibe "value")
            // e COUNT(*) (total de títulos)
            var sql = $@"
            SELECT
              -- Projecao (PROJECAO)
              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'PROJECAO') AS ProjectionTotal,
              (SELECT IFNULL(SUM(ar.amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'PROJECAO') AS ProjectionValue,

              -- Em aberto (WAITING)
              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING') AS OpenTotal,
              (SELECT IFNULL(SUM(ar.amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING') AS OpenValue,

              -- Vence hoje (WAITING e DueDate = hoje)
              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate = @Today) AS DueTodayTotal,
              (SELECT IFNULL(SUM(ar.amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate = @Today) AS DueTodayValue,

              -- Vence no mês (WAITING e DueDate no mês atual)
              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate BETWEEN @MonthStart AND @MonthEnd) AS DueMonthTotal,
              (SELECT IFNULL(SUM(ar.amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate BETWEEN @MonthStart AND @MonthEnd) AS DueMonthValue,

              -- Vencido (WAITING e DueDate < hoje)
              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate < @Today) AS OverdueTotal,
              (SELECT IFNULL(SUM(ar.amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'WAITING' AND ar.DueDate < @Today) AS OverdueValue,

              -- Pago no mês (PAID e paid_date no mês)
              (SELECT COUNT(1) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'PAID' AND ar.PayDate BETWEEN @MonthStart AND @MonthEnd) AS PaidMonthTotal,
              (SELECT IFNULL(SUM(ar.amount),0) FROM jmoficial.accounts_receivable ar {whereSql} AND ar.status = 'PAID' AND ar.PayDate BETWEEN @MonthStart AND @MonthEnd) AS PaidMonthValue
        ";

            // Truque: BuildWhere retorna "WHERE ...", então para subselects precisamos anexar AND...
            // Vamos ajustar: BuildWhere gera "WHERE ar.deleted_at IS NULL ..." e usa alias "ar"
            // Aqui está OK porque subselects também usam "accounts_receivable ar".
            // Mas precisamos garantir que whereSql sempre existe com "WHERE".
            // Se você preferir, eu faço outra função BuildWhereWithoutAlias.

            var result = await conn.QuerySingleAsync<AccountsReceivableSummaryDto>(sql, p);
            return result;
        }

        public async Task SettleAsync(int id, SettleAccountsReceivableRequest req)
        {
            await using var conn = await _context.OpenConnectionAsync();

            using var tx = conn.BeginTransaction();

            var ar = await conn.QuerySingleOrDefaultAsync<dynamic>(
            @"SELECT id, amount, pendingAmount, status
              FROM accounts_receivable
              WHERE id = @Id",
            new { Id = id }, tx);

            if (ar == null)
                throw new Exception("Título não encontrado.");

            if (ar.status == "PAID")
                throw new Exception("Este título já está pago.");

            decimal pending = ar.pendingAmount;
            decimal paidValue = req.PaidValue;

            if (paidValue <= 0)
                throw new Exception("Valor da baixa inválido.");

            if (paidValue > pending)
                throw new Exception("Valor da baixa maior que o valor pendente.");

            // 2️⃣ Calcular novo pendente / status
            decimal newPending = pending - paidValue;
            string newStatus = newPending <= 0 ? "PAID" : "WAITING";

            // 3️⃣ Atualizar título
            await conn.ExecuteAsync(
                @"UPDATE accounts_receivable
              SET pendingAmount = @PendingValue,
                  status = @Status,
                  PayDate = @PaidDate,
                  observations = IFNULL(@Observations, observations),
                  updatedAt = NOW()
              WHERE id = @Id",
                new
                {
                    PendingValue = newPending,
                    Status = newStatus,
                    PaidDate = newStatus == "PAID" ? req.PaidDate : null,
                    Observations = req.Observations,
                    Id = id
                },
                tx
            );

            // 4️⃣ (Opcional) salvar histórico da baixa
            await conn.ExecuteAsync(
                @"INSERT INTO accounts_receivable_settlements
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
                tx
            );

            tx.Commit();
        }

        private (string whereSql, DynamicParameters p) BuildWhere(AccountsReceivableQuery q)
        {
            var p = new DynamicParameters();

            var where = "WHERE 1 = 1";

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
                where += " AND ar.Category = @Category";
                p.Add("Category", q.Category.Trim());
            }

            if (!string.IsNullOrWhiteSpace(q.Status))
            {
                where += " AND ar.Status = @Status";
                p.Add("Status", q.Status.Trim().ToUpperInvariant());
            }

            if (!string.IsNullOrWhiteSpace(q.Search))
            {
                where += " AND (ar.description LIKE @Search OR ar.observations LIKE @Search OR ar.category LIKE @Search)";
                p.Add("Search", $"%{q.Search.Trim()}%");
            }

            return (where, p);
        }
    }
}
