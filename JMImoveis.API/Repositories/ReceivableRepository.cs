using Dapper;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.VisualBasic;
using MySqlConnector;
using System.Data;
using System.Data.Common;

namespace JMImoveisAPI.Repositories
{
    public class ReceivableRepository : IReceivableRepository
    {
        private readonly string _cs;
        public ReceivableRepository(IConfiguration cfg)
        {
            _cs = cfg.GetConnectionString("DefaultConnection")!;
            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
        }

        private async Task<MySqlConnection> OpenAsync()
        {
            var c = new MySqlConnection(_cs);
            await c.OpenAsync();
            return c;
        }
        public async Task<IEnumerable<Receivable>> GetReceivableAsync(DateTime? dateFrom, DateTime? dateTo, string TypeFilter, string categoriaFilter)
        {

            var typeF = "due_date";
            var categoria = "";

            if (TypeFilter == "create") typeF = "T0.created_at";

            if (categoriaFilter != "9999") categoria = $"AND T0.category_id = {categoriaFilter}";


            var sql = @$"SELECT T0.id, T0.series_id, T0.installment_no, T0.amount,
                                T0.description, T0.competence_date, T0.due_date, T0.received , T0.received_date, 
                                T0.category_id, T2.description as ""CategoryName"",
                                T0.account_id, T3.description as ""AccountName"",
                                T0.client_id, T1.name  AS ""ClientName"",
                                T0.cost_center_id , T4.name AS ""CenterCoustName"", 
                                reference, notes, T0.created_at, T0.updated_at, T0.deleted_at, 
                                recurrencing, periodic, parcelas, T0.status
                                FROM jm.receivables T0
                                left join jm.customers T1 ON T0.client_id = T1.id
                                left join jm.categories T2 ON T0.category_id = T2.id 
                                left join jm.account_plain T3 ON T0.account_id = T3.id 
                                left join jm.centrocusto T4 ON T0.cost_center_id = T4.id 

                                 WHERE (@DateFrom IS NULL OR {typeF} >= @DateFrom)
                                      AND (@DateTo IS NULL OR {typeF} <= @DateTo)
                                      AND T0.deleted_at IS NULL
                                      {categoria}

                                                             
                                group by T0.id, T0.series_id, T0.installment_no, T0.amount, T0.description, 
                                T0.competence_date, T0.due_date, T0.cost_center_id , T0.received , T0.received_date,
                                T0.category_id, T0.account_id, T0.client_id , reference, notes, T0.created_at, 
                                T0.updated_at, T0.deleted_at, recurrencing, periodic, parcelas, T0.status;";

            await using var con = await OpenAsync();
            return await con.QueryAsync<Receivable>(sql, new { DateFrom = dateFrom, DateTo = dateTo });
        }
        public async Task<IEnumerable<Payable>> GetPayablesAsync(DateTime? dateFrom, DateTime? dateTo, string TypeFilter, string categoriaFilter)
        {

            var typeF = "due_date";
            var categoria = "";

            if (TypeFilter == "create") typeF = "T0.created_at";

            if (categoriaFilter != "9999") categoria = $"AND T0.category_id = {categoriaFilter}";


            var sql = @$"SELECT T0.id, T0.series_id, T0.installment_no, T0.amount,
                                T0.description, T0.competence_date, T0.due_date, T0.paid, T0.paid_date,  
                                T0.category_id, T2.description as ""CategoryName"",
                                T0.account_id, T3.description as ""AccountName"",
                                T0.client_id, T1.name  AS ""ClientName"",
                                T0.cost_center_id , T4.name AS ""CenterCoustName"", 
                                reference, notes, T0.created_at, T0.updated_at, T0.deleted_at, 
                                recurrencing, periodic, parcelas, T0.status
                                FROM jm.payables T0
                                left join jm.customers T1 ON T0.client_id = T1.id
                                left join jm.categories T2 ON T0.category_id = T2.id 
                                left join jm.account_plain T3 ON T0.account_id = T3.id 
                                left join jm.centrocusto T4 ON T0.cost_center_id = T4.id

                                 WHERE (@DateFrom IS NULL OR {typeF} >= @DateFrom)
                                      AND (@DateTo IS NULL OR {typeF} <= @DateTo)
                                      AND T0.deleted_at IS NULL
                                      {categoria}

                                group by T0.id, T0.series_id, T0.installment_no, T0.amount, T0.description, 
                                T0.competence_date, T0.due_date, T0.cost_center_id , T0.paid, T0.paid_date,
                                T0.category_id, T0.account_id, T0.client_id , reference, notes, T0.created_at, 
                                T0.updated_at, T0.deleted_at, recurrencing, periodic, parcelas, T0.status;";

            await using var con = await OpenAsync();
            return await con.QueryAsync<Payable>(sql, new { DateFrom = dateFrom, DateTo = dateTo });

        }
        public async Task<IEnumerable<Receivable>> GetAllAsync(bool includeDeleted = false)
        {
            const string sql = @"SELECT * FROM receivables where status ='Em Aberto'                                
                                    ORDER BY due_date, id;";

            await using var con = await OpenAsync();
            return await con.QueryAsync<Receivable>(sql, new { inc = includeDeleted ? 1 : 0 });
        }

        public async Task<DreResponse> GetDreAsync(DreRequest req)
        {
            const string sqlLines = @"SELECT ap.id                                  AS accountId,
                                              ap.typeaccount                         AS section,       -- 'RECEITA' | 'DESPESA'
                                              ap.account                             AS accountCode,   -- ex: 1.1.2
                                              ap.description                         AS accountName,
                                              COALESCE(r.total_receita, 0)           AS totalReceita,  -- entradas
                                              COALESCE(p.total_despesa, 0)           AS totalDespesa,  -- saídas
                                              COALESCE(r.total_receita,0) - COALESCE(p.total_despesa,0) AS totalLiquido
                                            FROM account_plain ap
                                            LEFT JOIN (
                                              SELECT r.account_id, SUM(r.amount) AS total_receita
                                              FROM jm.receivables r
                                              WHERE r.competence_date >= @startDate
                                                AND r.competence_date <  DATE_ADD(@endDate, INTERVAL 1 DAY)
                                              GROUP BY r.account_id
                                            ) r ON r.account_id = ap.id
                                            LEFT JOIN (
                                              SELECT p.account_id, SUM(p.amount) AS total_despesa
                                              FROM jm.payables p
                                              WHERE p.due_date >= @startDate
                                                AND p.due_date <  DATE_ADD(@endDate, INTERVAL 1 DAY)
                                              GROUP BY p.account_id
                                            ) p ON p.account_id = ap.id
                                            WHERE (@categoryId IS NULL OR ap.idcategory = @categoryId)
                                            ORDER BY
                                              CASE ap.typeaccount WHEN 'RECEITA' THEN 0 ELSE 1 END,
                                              ap.account;
                                            ;";

            const string sqlTotals = @"SELECT IFNULL((
                                                SELECT SUM(r.amount)
                                                FROM jm.receivables r
                                                WHERE r.competence_date >= @startDate
                                                  AND r.competence_date < DATE_ADD(@endDate, INTERVAL 1 DAY)
                                                  AND (
                                                    @categoryId IS NULL OR EXISTS (
                                                      SELECT 1 FROM account_plain ap
                                                      WHERE ap.id = r.account_id AND ap.idcategory = @categoryId
                                                    )
                                                  )
                                              ),0) AS gross_revenue,
                                              IFNULL((
                                                SELECT SUM(p.amount)
                                                FROM jm.payables p
                                                WHERE p.due_date >= @startDate
                                                  AND p.due_date < DATE_ADD(@endDate, INTERVAL 1 DAY)
                                                  AND (
                                                    @categoryId IS NULL OR EXISTS (
                                                      SELECT 1 FROM account_plain ap
                                                      WHERE ap.id = p.account_id AND ap.idcategory = @categoryId
                                                    )
                                                  )
                                              ),0) AS total_expenses;
                                            -- Resultado Operacional = gross_revenue - total_expenses
                                            ";

            var p = new DynamicParameters();
            p.Add("@startDate", req.StartDate.Date);
            p.Add("@endDate", req.EndDate.Date);
            p.Add("@categoryId", req.CategoryId); // null = sem filtro

            await using var conn = await OpenAsync();
            var lines = await conn.QueryAsync<DreLine>(sqlLines, p);
            var totals = await conn.QuerySingleAsync<DreTotals>(sqlTotals, p);


            return new DreResponse
            {
                Totals = totals,
                Lines = lines.ToList()
            };

        }

        public async Task<IEnumerable<Payable>> GetAllAsync()
        {
            const string sql = @"SELECT * FROM payable where status ='WAITING'                                
                                    ORDER BY due_date, id;";

            await using var con = await OpenAsync();
            return await con.QueryAsync<Payable>(sql);
        }

        public async Task<Receivable?> GetAsync(int id)
        {
            const string sql = "SELECT * FROM receivables WHERE id=@id;";
            await using var con = await OpenAsync();
            return await con.QuerySingleOrDefaultAsync<Receivable>(sql, new { id });
        }

        public async Task<IEnumerable<Receivable>> GetByPeriodAsync(DateTime from, DateTime to, bool includeDeleted = false, bool byDueDate = true)
        {
            var where = byDueDate ? "due_date BETWEEN @from AND @to" : "competence_date BETWEEN @from AND @to";

            var sql = $@"SELECT * FROM receivables
                         WHERE {where} AND (@inc = 1 OR deleted_at IS NULL)
                         ORDER BY {(byDueDate ? "due_date" : "competence_date")}, id;";

            await using var con = await OpenAsync();
            return await con.QueryAsync<Receivable>(sql, new { from, to, inc = includeDeleted ? 1 : 0 });
        }

        public async Task CreatePayableAsync(Payable seed)
        {
            var sql = $@"INSERT INTO payables
                                    (series_id, installment_no, amount, description, competence_date, due_date,
                                     paid, paid_date, category_id, account_id, client_id, cost_center_id,
                                     reference, notes, created_at, updated_at, recurrencing, periodic, parcelas)
                                VALUES
                                (@SeriesId, @InstallmentNo, @Amount, @Description, @CompetenceDate, @DueDate,
                                 0, NULL, @CategoryId, @AccountId, @ClientId, @CostCenterId,
                                 @Reference, @Notes, UTC_TIMESTAMP(), UTC_TIMESTAMP(), @Recurrencing, @Periodic, @Parcelas);";

            await using var con = await OpenAsync();
            await con.ExecuteAsync(sql, seed);

        }

        public async Task<int[]> CreateAsync(Receivable seed)
        {
            // Se Parcelas>1 → criar série/parcelas. Caso contrário, insere 1 linha.
            await using var con = await OpenAsync();
            await using var tx = await con.BeginTransactionAsync();

            try
            {
                var createdIds = new List<int>();

                int parcelas = seed.Parcelas.GetValueOrDefault(1);
                bool gerarParcelas = seed.Recurrencing == true && parcelas > 1;

                if (!seed.Amount.HasValue)
                    throw new ArgumentException("Amount deve ser informado", nameof(seed));

                if (!seed.DueDate.HasValue)
                    throw new ArgumentException("DueDate deve ser informado", nameof(seed));

                // se for parcelado e valor total está em Amount → valor por parcela:
                decimal valorParcela = gerarParcelas
                    ? decimal.Round(seed.Amount.Value / parcelas, 2)
                    : seed.Amount.Value;

                // helper de insert
                const string ins = @"INSERT INTO receivables
                                    (series_id, installment_no, amount, description, competence_date, due_date,
                                     received, received_date, category_id, account_id, client_id, cost_center_id,
                                     reference, notes, created_at, updated_at, recurrencing, periodic, parcelas)
                                VALUES
                                (@SeriesId, @InstallmentNo, @Amount, @Description, @CompetenceDate, @DueDate,
                                 0, NULL, @CategoryId, @AccountId, @ClientId, @CostCenterId,
                                 @Reference, @Notes, UTC_TIMESTAMP(), UTC_TIMESTAMP(), @Recurrencing, @Periodic, @Parcelas);
                                SELECT LAST_INSERT_ID();";

                // 1ª parcela
                var firstId = await con.ExecuteScalarAsync<int>(ins, new
                {
                    SeriesId = (int?)null,
                    InstallmentNo = gerarParcelas ? 1 : (int?)null,
                    Amount = valorParcela,
                    seed.Description,
                    CompetenceDate = seed.CompetenceDate == default ? seed.DueDate : seed.CompetenceDate,
                    seed.DueDate,
                    seed.CategoryId,
                    seed.AccountId,
                    seed.ClientId,
                    seed.CostCenterId,
                    seed.Reference,
                    seed.Notes,
                    Recurrencing = seed.Recurrencing,
                    Periodic = seed.Periodic,
                    Parcelas = seed.Parcelas
                }, tx);

                createdIds.Add(firstId);

                if (gerarParcelas)
                {
                    // usa o próprio primeiro id como SeriesId
                    const string upFirst = @"UPDATE receivables SET series_id=@sid WHERE id=@id;";
                    await con.ExecuteAsync(upFirst, new { sid = firstId, id = firstId }, tx);

                    var due = seed.DueDate.Value;
                    for (int i = 2; i <= parcelas; i++)
                    {
                        due = NextDate(due, seed.Periodic ?? "MONTHLY", 1);
                        var id = await con.ExecuteScalarAsync<int>(ins, new
                        {
                            SeriesId = firstId,
                            InstallmentNo = i,
                            Amount = valorParcela,
                            seed.Description,
                            CompetenceDate = due,   // regra simples: competência = vencimento
                            DueDate = due,
                            seed.CategoryId,
                            seed.AccountId,
                            seed.ClientId,
                            seed.CostCenterId,
                            seed.Reference,
                            seed.Notes,
                            Recurrencing = seed.Recurrencing,
                            Periodic = seed.Periodic,
                            Parcelas = seed.Parcelas
                        }, tx);
                        createdIds.Add(id);
                    }
                }

                await tx.CommitAsync();
                return createdIds.ToArray();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateAsync(int id, Receivable r)
        {
            const string sql = @"UPDATE receivables SET
                                     amount=@Amount, description=@Description, competence_date=@CompetenceDate, due_date=@DueDate,
                                     received=@Received, received_date=@ReceivedDate, category_id=@CategoryId, account_id=@AccountId,
                                     client_id=@ClientId, cost_center_id=@CostCenterId, reference=@Reference, notes=@Notes,
                                     recurrencing=@Recurrencing, periodic=@Periodic, parcelas=@Parcelas,
                                     updated_at=UTC_TIMESTAMP()
                                    WHERE id=@Id AND deleted_at IS NULL;";
            r.Id = id;
            await using var con = await OpenAsync();
            return await con.ExecuteAsync(sql, r) > 0;
        }

        public async Task<bool> UpdateAsync(int id, Payable r)
        {
            const string sql = @" UPDATE payables SET
                                     amount=@Amount, description=@Description, competence_date=@CompetenceDate, due_date=@DueDate,
                                     paid=@Paid, paid_date=@PaidDate, category_id=@CategoryId, account_id=@AccountId,
                                     client_id=@ClientId, cost_center_id=@CostCenterId, reference=@Reference, notes=@Notes,
                                     recurrencing=@Recurrencing, periodic=@Periodic, parcelas=@Parcelas,
                                     updated_at=UTC_TIMESTAMP(), status=@Status
                                    WHERE id=@Id AND deleted_at IS NULL;";

            r.Id = id;
            await using var con = await OpenAsync();
            return await con.ExecuteAsync(sql, r) > 0;
        }

        public async Task<bool> MarkReceivedAsync(int id, MarkAsReceivedRequest obj)
        {
            if (obj.Amount <= 0) throw new ArgumentException("Amount deve ser > 0");
            const string sql = @"UPDATE receivables
                                       SET received = 1,
                                           received_date = @receivedDate,
                                           account_id = @accountId,
                                           amount = @amount,           -- opcional: se quiser registrar o valor efetivo
                                           updated_at = NOW()
                                     WHERE id = @id;";

            await using var con = await OpenAsync();

            return await con.ExecuteAsync(sql, new
            {
                id,
                receivedDate = obj.ReceivedDate,
                accountId = obj.AccountId,
                amount = obj.Amount
            }) > 0;
        }

        public async Task<bool> MarkPaidAsync(int id, MarkAsPaidRequest obj)
        {
            if (obj.Amount <= 0) throw new ArgumentException("Amount deve ser > 0");

            const string sql = @"UPDATE payables
                                       SET paid = 1,
                                           paid_date = @paidDate,
                                           account_id = @accountId,
                                           amount = @amount,        -- opcional: override do valor
                                           updated_at = NOW()
                                     WHERE id = @id;";

            await using var con = await OpenAsync();

            return await con.ExecuteAsync(sql, new
            {
                id,
                paidDate = obj.PaidDate,
                accountId = obj.AccountId,
                amount = obj.Amount
            }) > 0;
        }

        public async Task<bool> UnreceiveAsync(int id)
        {
            const string sql = @"UPDATE receivables SET received=0, received_date=NULL, updated_at=UTC_TIMESTAMP()
                             WHERE id=@id AND deleted_at IS NULL;";
            await using var con = await OpenAsync();
            return await con.ExecuteAsync(sql, new { id }) > 0;
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            const string sql = @"UPDATE receivables SET deleted_at=UTC_TIMESTAMP(), updated_at=UTC_TIMESTAMP()
                             WHERE id=@id AND deleted_at IS NULL;";
            await using var con = await OpenAsync();
            return await con.ExecuteAsync(sql, new { id }) > 0;
        }

        public async Task<bool> HardDeleteAsync(int id)
        {
            const string sql = @"DELETE FROM receivables WHERE id=@id;";
            await using var con = await OpenAsync();
            return await con.ExecuteAsync(sql, new { id }) > 0;
        }

        // ---- helpers ----
        private static DateTime NextDate(DateTime d, string periodic, int steps)
        {
            var p = (periodic ?? "MONTHLY").Trim().ToUpperInvariant();
            return p switch
            {
                "DAILY" or "DIARIO" => d.AddDays(steps),
                "WEEKLY" or "SEMANAL" => d.AddDays(7 * steps),
                "BIWEEKLY" or "QUINZENAL" => d.AddDays(14 * steps),
                "MONTHLY" or "MENSAL" => d.AddMonths(steps),
                "BIMONTHLY" or "BIMESTRAL" => d.AddMonths(2 * steps),
                "QUARTERLY" or "TRIMESTRAL" => d.AddMonths(3 * steps),
                "YEARLY" or "ANUAL" => d.AddYears(steps),
                _ => d.AddMonths(steps)
            };
        }

        public Task<IEnumerable<Receivable>> GetByPeriodAsync(DateTime from, DateTime to)
        {
            throw new NotImplementedException();
        }

        public async Task<List<CostCenter>> GetAllAsync(CancellationToken ct)
        {
            const string sql = @"SELECT id, name FROM jm.cost_centers ORDER BY name;";
            await using var con = await OpenAsync();
            var rows = await con.QueryAsync<CostCenter>(sql);
            return rows.ToList();
        }

        public async Task<SummaryResponse> GetMonthlySummaryAsync(DateTime start, DateTime end, string type, CancellationToken ct)
        {
            // agregados por CC
            var filterRevenue = type is "all" or "revenue";
            var filterExpense = type is "all" or "expense";

            const string baseSql = @"
                                        SELECT
                                          cc.id AS cost_center_id,
                                          cc.name AS cost_center_name,
                                          COALESCE(r.receita,0) AS revenue,
                                          COALESCE(p.despesa,0) AS expense
                                        FROM jm.cost_centers cc
                                        LEFT JOIN (
                                          SELECT r.cost_center_id, SUM(r.amount) AS receita
                                          FROM jm.receivables r
                                          WHERE r.competence_date >= @start AND r.competence_date < DATE_ADD(@end, INTERVAL 1 DAY)
                                          GROUP BY r.cost_center_id
                                        ) r ON r.cost_center_id = cc.id
                                        LEFT JOIN (
                                          SELECT p.cost_center_id, SUM(p.amount) AS despesa
                                          FROM jm.payables p
                                          WHERE p.due_date >= @start AND p.due_date < DATE_ADD(@end, INTERVAL 1 DAY)
                                          GROUP BY p.cost_center_id
                                        ) p ON p.cost_center_id = cc.id
                                        ORDER BY cc.name;";

            await using var con = await OpenAsync();
            var items = (await con.QueryAsync<CostCenterSummary>(baseSql, new { start = start.Date, end = end.Date }))
                .ToList();

            if (!filterRevenue) items.ForEach(i => i.Revenue = 0);
            if (!filterExpense) items.ForEach(i => i.Expense = 0);

            return new SummaryResponse
            {
                Items = items,
                TotalRevenue = items.Sum(i => i.Revenue),
                TotalExpense = items.Sum(i => i.Expense)
            };
        }


        public async Task<List<Entry>> GetEntriesAsync(int costCenterId, DateTime start, DateTime end, string type, CancellationToken ct)
        {
            var wantR = type is "all" or "revenue";
            var wantP = type is "all" or "expense";

            await using var con = await OpenAsync();
            var list = new List<Entry>();

            if (wantR)
            {
                const string sqlR = @"
                                        SELECT
                                          r.id, 'RECEIVABLE' AS kind,
                                          r.competence_date AS date,
                                          r.description,
                                          r.account_id AS account_id,
                                          ap.account AS account_code,
                                          ap.description AS account_name,
                                          r.category_id, r.cost_center_id,
                                          cc.name AS cost_center_name,
                                          r.amount AS amount
                                        FROM jm.receivables r
                                        JOIN account_plain ap ON ap.id = r.account_id
                                        LEFT JOIN jm.cost_centers cc ON cc.id = r.cost_center_id
                                        WHERE r.cost_center_id = @cc
                                          AND r.competence_date >= @start AND r.competence_date < DATE_ADD(@end, INTERVAL 1 DAY)
                                        ORDER BY r.competence_date;";
                list.AddRange(await con.QueryAsync<Entry>(sqlR, new { cc = costCenterId, start = start.Date, end = end.Date }));
            }

            if (wantP)
            {
                const string sqlP = @"
                                        SELECT
                                          p.id, 'PAYABLE' AS kind,
                                          p.due_date AS date,
                                          p.description,
                                          p.account_id AS account_id,
                                          ap.account AS account_code,
                                          ap.description AS account_name,
                                          p.category_id, p.cost_center_id,
                                          cc.name AS cost_center_name,
                                          p.amount AS amount
                                        FROM jm.payables p
                                        JOIN account_plain ap ON ap.id = p.account_id
                                        LEFT JOIN jm.cost_centers cc ON cc.id = p.cost_center_id
                                        WHERE p.cost_center_id = @cc
                                          AND p.due_date >= @start AND p.due_date < DATE_ADD(@end, INTERVAL 1 DAY)
                                        ORDER BY p.due_date;";
                list.AddRange(await con.QueryAsync<Entry>(sqlP, new { cc = costCenterId, start = start.Date, end = end.Date }));
            }

            return list.OrderBy(x => x.Date).ToList();
        }

        public async Task ReclassifyAsync(EntryKind kind, int id, ReclassifyRequest body, CancellationToken ct)
        {
            await using var con = await OpenAsync();
            using var tx = con.BeginTransaction();

            var sql = kind == EntryKind.RECEIVABLE
                ? @"UPDATE jm.receivables
                SET cost_center_id = @cc,
                    account_id     = COALESCE(@acc, account_id),
                    category_id    = COALESCE(@cat, category_id)
              WHERE id = @id"
                : @"UPDATE jm.payables
                SET cost_center_id = @cc,
                    account_id     = COALESCE(@acc, account_id),
                    category_id    = COALESCE(@cat, category_id)
              WHERE id = @id";

            await con.ExecuteAsync(sql, new
            {
                id,
                cc = body.CostCenterId,
                acc = body.AccountId,
                cat = body.CategoryId
            }, tx);



            tx.Commit();
        }

        public async Task<List<AccountOption>> SearchAsync(string? q, CancellationToken ct)
        {
            var like = string.IsNullOrWhiteSpace(q) ? "%" : $"%{q}%";
            const string sql = @"
                                SELECT id, account AS code, description
                                FROM account_plain
                                WHERE account LIKE @q OR description LIKE @q
                                ORDER BY account
                                LIMIT 200;";

            await using var con = await OpenAsync();
            var rows = await con.QueryAsync<AccountOption>(sql, new { q = like });
            return rows.ToList();
        }

        public async Task<AccountSummaryResponse> GetMonthlySummaryAsync(DateTime start, DateTime end, string type, int? costCenterId, int? categoryId, CancellationToken ct)
        
        {
            const string sql = @"
                                    SELECT
                                      ap.id            AS account_id,
                                      ap.typeaccount   AS section,
                                      ap.account       AS account_code,
                                      ap.description   AS account_name,
                                      COALESCE(r.receita,0) AS revenue,
                                      COALESCE(p.despesa,0) AS expense
                                    FROM account_plain ap
                                    LEFT JOIN (
                                      SELECT r.account_id, SUM(r.amount) AS receita
                                      FROM jm.receivables r
                                      WHERE r.competence_date >= @start
                                        AND r.competence_date <  DATE_ADD(@end, INTERVAL 1 DAY)
                                        AND (@costCenterId IS NULL OR r.cost_center_id = @costCenterId)
                                        -- se quiser que o filtro de categoria afete a soma, assegure que a conta do lançamento pertença à categoria
                                        AND (@categoryId IS NULL OR EXISTS (SELECT 1 FROM account_plain apx WHERE apx.id = r.account_id AND apx.idcategory = @categoryId))
                                      GROUP BY r.account_id
                                    ) r ON r.account_id = ap.id
                                    LEFT JOIN (
                                      SELECT p.account_id, SUM(p.amount) AS despesa
                                      FROM jm.payables p
                                      WHERE p.due_date >= @start
                                        AND p.due_date <  DATE_ADD(@end, INTERVAL 1 DAY)
                                        AND (@costCenterId IS NULL OR p.cost_center_id = @costCenterId)
                                        AND (@categoryId IS NULL OR EXISTS (SELECT 1 FROM account_plain apx WHERE apx.id = p.account_id AND apx.idcategory = @categoryId))
                                      GROUP BY p.account_id
                                    ) p ON p.account_id = ap.id
                                    -- se filtrar por categoria, mostramos apenas as contas daquela categoria
                                    WHERE (@categoryId IS NULL OR ap.idcategory = @categoryId)
                                    ORDER BY CASE ap.typeaccount WHEN 'RECEITA' THEN 0 ELSE 1 END, ap.account;";

            await using var con = await OpenAsync();

            var items = (await con.QueryAsync<AccountSummary>(sql, new
            {
                start = start.Date,
                end = end.Date,
                costCenterId,
                categoryId
            })).ToList();

            if (type == "revenue") items.ForEach(i => i.Expense = 0);
            if (type == "expense") items.ForEach(i => i.Revenue = 0);

            return new AccountSummaryResponse
            {
                Items = items,
                TotalRevenue = items.Sum(i => i.Revenue),
                TotalExpense = items.Sum(i => i.Expense)
            };
        }

        public async Task<List<Entry>> GetEntriesByAccountAsync(int accountId, DateTime start, DateTime end, string type, int? costCenterId, int? categoryId, CancellationToken ct)
        {
            var list = new List<Entry>();

            await using var con = await OpenAsync();

            if (type is "all" or "revenue")
            {
                const string sqlR = @"SELECT
                                          r.id, 'RECEIVABLE' AS kind,
                                          r.competence_date  AS date,
                                          r.description,
                                          r.account_id       AS account_id,
                                          ap.account         AS account_code,
                                          ap.description     AS account_name,
                                          r.category_id,
                                          r.cost_center_id,
                                          cc.name            AS cost_center_name,
                                          r.amount           AS amount
                                        FROM jm.receivables r
                                        JOIN account_plain ap ON ap.id = r.account_id
                                        LEFT JOIN jm.cost_centers cc ON cc.id = r.cost_center_id
                                        WHERE r.account_id = @acc
                                          AND r.competence_date >= @start
                                          AND r.competence_date <  DATE_ADD(@end, INTERVAL 1 DAY)
                                          AND (@costCenterId IS NULL OR r.cost_center_id = @costCenterId)
                                          AND (@categoryId  IS NULL OR r.category_id    = @categoryId)
                                        ORDER BY r.competence_date;";

                list.AddRange(await con.QueryAsync<Entry>(sqlR, new
                {
                    acc = accountId,
                    start = start.Date,
                    end = end.Date,
                    costCenterId,
                    categoryId
                }));
            }

            if (type is "all" or "expense")
            {
                const string sqlP = @"SELECT
                                              p.id, 'PAYABLE' AS kind,
                                              p.due_date      AS date,
                                              p.description,
                                              p.account_id    AS account_id,
                                              ap.account      AS account_code,
                                              ap.description  AS account_name,
                                              p.category_id,
                                              p.cost_center_id,
                                              cc.name         AS cost_center_name,
                                              p.amount        AS amount
                                            FROM jm.payables p
                                            JOIN account_plain ap ON ap.id = p.account_id
                                            LEFT JOIN jm.cost_centers cc ON cc.id = p.cost_center_id
                                            WHERE p.account_id = @acc
                                              AND p.due_date >= @start
                                              AND p.due_date <  DATE_ADD(@end, INTERVAL 1 DAY)
                                              AND (@costCenterId IS NULL OR p.cost_center_id = @costCenterId)
                                              AND (@categoryId  IS NULL OR p.category_id    = @categoryId)
                                            ORDER BY p.due_date;";


                list.AddRange(await con.QueryAsync<Entry>(sqlP, new
                {
                    acc = accountId,
                    start = start.Date,
                    end = end.Date,
                    costCenterId,
                    categoryId
                }));
            }

            return list.OrderBy(e => e.Date).ToList();
        }
    }
}
