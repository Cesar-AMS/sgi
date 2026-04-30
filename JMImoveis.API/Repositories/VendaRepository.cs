using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Connections;
using Microsoft.Extensions.Options;
using MySqlConnector;
using System.Data;
using static Dapper.SqlMapper;

namespace JMImoveisAPI.Repositories
{
    public class VendaRepository : IVendaRepository
    {
        private readonly DapperContext _context;
        private readonly DashboardOptions _opt;
        private readonly CorretorDashboardOptions _optCorretor;

        public VendaRepository(DapperContext context, IOptionsSnapshot<DashboardOptions> opt, IOptionsSnapshot<CorretorDashboardOptions> optCorretor)
        {
            _context = context;
            _opt = opt.Value;
            _optCorretor = optCorretor.Value;
        }

        public async Task<CorretorDashboardResponse> GetDashboardCorretorAsync(int year, int month, int? managerId, CancellationToken ct = default)
        {
            // intervalo do ANO (porque precisamos das 12 colunas)
            var yearStart = new DateTime(year, 1, 1);
            var yearEnd = new DateTime(year, 12, 31, 23, 59, 59);

            const string sql = @"
                                    -- 0) Managers (opções)
                                    SELECT u.id, u.name
                                    FROM jm.users u
                                    WHERE u.jobpositionId = 3 /* gerente */
                                    ORDER BY u.name;

                                    -- 1) Salários - CORRETORES (notes='SALARIO', reference=user_id, jobposition=2)
                                    SELECT u.name AS Name,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=1  THEN p.amount ELSE 0 END) AS m1,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=2  THEN p.amount ELSE 0 END) AS m2,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=3  THEN p.amount ELSE 0 END) AS m3,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=4  THEN p.amount ELSE 0 END) AS m4,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=5  THEN p.amount ELSE 0 END) AS m5,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=6  THEN p.amount ELSE 0 END) AS m6,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=7  THEN p.amount ELSE 0 END) AS m7,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=8  THEN p.amount ELSE 0 END) AS m8,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=9  THEN p.amount ELSE 0 END) AS m9,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=10 THEN p.amount ELSE 0 END) AS m10,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=11 THEN p.amount ELSE 0 END) AS m11,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=12 THEN p.amount ELSE 0 END) AS m12
                                    FROM (
                                      SELECT p.*, COALESCE(p.competence_date, p.due_date) AS base_date
                                      FROM jm.payables p
                                      WHERE p.notes = 'SALARIO'
                                    ) p
                                    JOIN jm.users u
                                      ON u.id = CAST(p.reference AS UNSIGNED)
                                    WHERE u.jobpositionId = 2 /* corretor */
                                      AND base_date BETWEEN @yearStart AND @yearEnd
                                      AND (@managerId IS NULL OR u.gerente_id = @managerId)
                                    GROUP BY u.name
                                    ORDER BY u.name;

                                    -- 2) Salários - GERENTES
                                    SELECT u.name AS Name,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=1  THEN p.amount ELSE 0 END) AS m1,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=2  THEN p.amount ELSE 0 END) AS m2,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=3  THEN p.amount ELSE 0 END) AS m3,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=4  THEN p.amount ELSE 0 END) AS m4,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=5  THEN p.amount ELSE 0 END) AS m5,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=6  THEN p.amount ELSE 0 END) AS m6,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=7  THEN p.amount ELSE 0 END) AS m7,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=8  THEN p.amount ELSE 0 END) AS m8,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=9  THEN p.amount ELSE 0 END) AS m9,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=10 THEN p.amount ELSE 0 END) AS m10,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=11 THEN p.amount ELSE 0 END) AS m11,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=12 THEN p.amount ELSE 0 END) AS m12
                                    FROM (
                                      SELECT p.*, COALESCE(p.competence_date, p.due_date) AS base_date
                                      FROM jm.payables p
                                      WHERE p.notes = 'SALARIO'
                                    ) p
                                    JOIN jm.users u
                                      ON u.id = CAST(p.reference AS UNSIGNED)
                                    WHERE u.jobpositionId = 3 /* gerente */
                                      AND base_date BETWEEN @yearStart AND @yearEnd
                                      AND (@managerId IS NULL OR u.id = @managerId)
                                    GROUP BY u.name
                                    ORDER BY u.name;

                                    -- 3) Comissões - CORRETORES (p.category = realtor; p.reference = 'SALE:{id}')
                                    SELECT u.name AS Name,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=1  THEN p.amount ELSE 0 END) AS m1,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=2  THEN p.amount ELSE 0 END) AS m2,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=3  THEN p.amount ELSE 0 END) AS m3,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=4  THEN p.amount ELSE 0 END) AS m4,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=5  THEN p.amount ELSE 0 END) AS m5,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=6  THEN p.amount ELSE 0 END) AS m6,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=7  THEN p.amount ELSE 0 END) AS m7,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=8  THEN p.amount ELSE 0 END) AS m8,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=9  THEN p.amount ELSE 0 END) AS m9,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=10 THEN p.amount ELSE 0 END) AS m10,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=11 THEN p.amount ELSE 0 END) AS m11,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=12 THEN p.amount ELSE 0 END) AS m12
                                    FROM (
                                      SELECT p.*, COALESCE(p.competence_date, p.due_date) AS base_date
                                      FROM jm.payables p
                                      WHERE p.category_id = @catRealtor
                                        AND p.reference LIKE 'SALE:%'
                                    ) p
                                    JOIN jm.sales s
                                      ON p.reference = CONCAT('SALE:', s.id)
                                    JOIN jm.users u
                                      ON u.id = s.realtor_id
                                    WHERE base_date BETWEEN @yearStart AND @yearEnd
                                      AND (@managerId IS NULL OR s.manager_id = @managerId)
                                    GROUP BY u.name
                                    ORDER BY u.name;

                                    -- 4) Comissões - GERENTES (p.category = manager; join sales → manager_id)
                                    SELECT u.name AS Name,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=1  THEN p.amount ELSE 0 END) AS m1,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=2  THEN p.amount ELSE 0 END) AS m2,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=3  THEN p.amount ELSE 0 END) AS m3,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=4  THEN p.amount ELSE 0 END) AS m4,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=5  THEN p.amount ELSE 0 END) AS m5,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=6  THEN p.amount ELSE 0 END) AS m6,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=7  THEN p.amount ELSE 0 END) AS m7,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=8  THEN p.amount ELSE 0 END) AS m8,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=9  THEN p.amount ELSE 0 END) AS m9,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=10 THEN p.amount ELSE 0 END) AS m10,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=11 THEN p.amount ELSE 0 END) AS m11,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=12 THEN p.amount ELSE 0 END) AS m12
                                    FROM (
                                      SELECT p.*, COALESCE(p.competence_date, p.due_date) AS base_date
                                      FROM jm.payables p
                                      WHERE p.category_id = @catManager
                                        AND p.reference LIKE 'SALE:%'
                                    ) p
                                    JOIN jm.sales s
                                      ON p.reference = CONCAT('SALE:', s.id)
                                    JOIN jm.users u
                                      ON u.id = s.manager_id
                                    WHERE base_date BETWEEN @yearStart AND @yearEnd
                                      AND (@managerId IS NULL OR s.manager_id = @managerId)
                                    GROUP BY u.name
                                    ORDER BY u.name;

                                    -- 5) Despesas por Filiais (tudo que não é salário nem comissão)
                                    SELECT
                                      CONCAT('Filial #', IFNULL(p.cost_center_id, 0)) AS Name,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=1  THEN p.amount ELSE 0 END) AS m1,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=2  THEN p.amount ELSE 0 END) AS m2,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=3  THEN p.amount ELSE 0 END) AS m3,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=4  THEN p.amount ELSE 0 END) AS m4,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=5  THEN p.amount ELSE 0 END) AS m5,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=6  THEN p.amount ELSE 0 END) AS m6,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=7  THEN p.amount ELSE 0 END) AS m7,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=8  THEN p.amount ELSE 0 END) AS m8,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=9  THEN p.amount ELSE 0 END) AS m9,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=10 THEN p.amount ELSE 0 END) AS m10,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=11 THEN p.amount ELSE 0 END) AS m11,
                                      SUM(CASE WHEN YEAR(base_date)=@year AND MONTH(base_date)=12 THEN p.amount ELSE 0 END) AS m12
                                    FROM (
                                      SELECT p.*, COALESCE(p.competence_date, p.due_date) AS base_date
                                      FROM jm.payables p
                                      WHERE (p.notes IS NULL OR p.notes <> 'SALARIO')
                                        AND p.category_id NOT IN (@catRealtor, @catManager)
                                    ) p
                                    WHERE base_date BETWEEN @yearStart AND @yearEnd
                                    GROUP BY p.cost_center_id
                                    ORDER BY Name;
                                    ";

            await using var conn = await _context.OpenConnectionAsync();
         
            var multi = await conn.QueryMultipleAsync(sql, new
            {
                year,
                yearStart,
                yearEnd,
                managerId,
                catRealtor = _optCorretor.CategoryRealtor,
                catManager = _optCorretor.CategoryManager
            });

            // managers
            var managers = (await multi.ReadAsync<(int id, string name)>()).ToList();

            // helpers
            static Row12 MapRow(dynamic row)
            {
                return new Row12
                {
                    Name = (string)row.Name,
                    Values = new[]
                    {
                    (decimal)row.m1,(decimal)row.m2,(decimal)row.m3,(decimal)row.m4,(decimal)row.m5,(decimal)row.m6,
                    (decimal)row.m7,(decimal)row.m8,(decimal)row.m9,(decimal)row.m10,(decimal)row.m11,(decimal)row.m12
                }
                };
            }

            var salariosCorretores = (await multi.ReadAsync()).Select(MapRow).ToList();
            var salariosGerentes = (await multi.ReadAsync()).Select(MapRow).ToList();
            var comissoesCorretores = (await multi.ReadAsync()).Select(MapRow).ToList();
            var comissoesGerentes = (await multi.ReadAsync()).Select(MapRow).ToList();
            var despesasFiliais = (await multi.ReadAsync()).Select(MapRow).ToList();

            return new CorretorDashboardResponse
            {
                ManagerOptions = new[] { new ManagerOption { Id = null, Label = "Todos" } }
                                  .Concat(managers.Select(m => new ManagerOption { Id = m.id, Label = m.name }))
                                  .ToList(),
                DefaultManagerId = null,

                SalariosCorretores = salariosCorretores,
                SalariosGerentes = salariosGerentes,
                ComissoesCorretores = comissoesCorretores,
                ComissoesGerentes = comissoesGerentes,
                DespesasFiliais = despesasFiliais
            };

        }

        public async Task<DashboardResponse> GetDashboardAsync(int year, int month, CancellationToken ct = default)
        {
            // intervalo fechado no mês
            var start = new DateTime(year, month, 1);
            var end = start.AddMonths(1).AddTicks(-1); // último instante do mês
            var endDateOnly = new DateTime(year, month, DateTime.DaysInMonth(year, month)); // útil p/ comparações por data

            //1 Vendas do mês
            const string sql = @"SELECT COUNT(*) AS VendasQtd
                                FROM jmoficial.sales s
                                WHERE s.deleted_at IS NULL
                                  AND (s.status IS NULL OR UPPER(s.status) <> 'FAILED')
                                  AND s.selled_at >= @start AND s.selled_at <= @end;

                                -- 2) Ato (receivables Acts, CC=1) no mês por competence_date OU due_date (priorizar due_date se existir)
                                SELECT
                                  IFNULL(SUM(r.amount), 0) AS Ato
                                FROM jmoficial.receivables r
                                WHERE r.category_id = @catActs
                                  AND r.cost_center_id = 1
                                  AND COALESCE(r.due_date, r.competence_date) >= @start
                                  AND COALESCE(r.due_date, r.competence_date) <= @end;

                                -- 3) Parcelas (receivables parcelas) no mês
                                SELECT
                                  IFNULL(SUM(r.amount), 0) AS Parcelas
                                FROM jmoficial.receivables r
                                WHERE r.category_id = @catInstall
                                  AND COALESCE(r.due_date, r.competence_date) >= @start
                                  AND COALESCE(r.due_date, r.competence_date) <= @end;

                                -- 4) Despesas no mês (payables)
                                SELECT
                                  IFNULL(SUM(p.amount), 0) AS DespesasTotal
                                FROM jmoficial.payables p
                                WHERE COALESCE(p.competence_date, p.due_date) >= @start
                                  AND COALESCE(p.competence_date, p.due_date) <= @end;

                                -- 5) Inadimplência (MÊS): base = receivíveis com due_date no mês
                                --    qtdMes = total com due_date no mês
                                --    emAberto = não recebidos com due_date no mês
                                --    pctMes = emAberto / qtdMes * 100
                                SELECT
                                  COUNT(*)                              AS QtdMes,
                                  SUM(CASE WHEN r.received = 0 OR r.received IS NULL THEN 1 ELSE 0 END) AS EmAbertoMes,
                                  IFNULL(SUM(CASE WHEN r.received = 1 AND r.received_date >= @start AND r.received_date <= @end THEN r.amount ELSE 0 END), 0) AS RecebidosNoMes,
                                  SUM(CASE WHEN r.received = 1 AND r.received_date >= @start AND r.received_date <= @end THEN 1 ELSE 0 END) AS PagantesNoMes
                                FROM jmoficial.receivables r
                                WHERE r.due_date >= @start AND r.due_date <= @end;

                                -- 6) Inadimplência (GERAL até fim do mês): base = receivíveis com due_date <= fim do mês
                                --    emAbertoTotal = não recebidos e já vencidos até fim do mês
                                --    valorAberto = soma dos não recebidos e vencidos até fim do mês
                                SELECT
                                  COUNT(*) AS TotalAteFim,
                                  SUM(CASE WHEN (r.received = 0 OR r.received IS NULL) AND r.due_date <= @end THEN 1 ELSE 0 END) AS EmAbertoTotal,
                                  IFNULL(SUM(CASE WHEN (r.received = 0 OR r.received IS NULL) AND r.due_date <= @end THEN r.amount ELSE 0 END), 0) AS ValorAberto
                                FROM jmoficial.receivables r
                                WHERE r.due_date <= @end;

                                -- 7) Série: Vendas por corretor (nome se existir; senão usa 'Corretor #ID')
                                SELECT
                                  COALESCE(NULLIF(TRIM(u.name), ''), CONCAT('Corretor #', IFNULL(s.realtor_id, 0))) AS Label,
                                  COUNT(*) AS Qtd
                                FROM jmoficial.sales s
                                left join users u on s.realtor_id = u.id 
                                WHERE s.deleted_at IS NULL
                                  AND (s.status IS NULL OR UPPER(s.status) <> 'FAILED')
                                  AND s.selled_at >= @start AND s.selled_at <= @end
                                GROUP BY 1
                                ORDER BY Qtd DESC, Label ASC
                                LIMIT 20;

                                -- 8) Série: Despesas por categoria (se não houver tabela de categorias, usa 'Cat #ID')
                                SELECT
                                  CONCAT('Cat #', IFNULL(p.category_id, 0)) AS Label,
                                  IFNULL(SUM(p.amount), 0) AS Total
                                FROM jmoficial.payables p
                                WHERE COALESCE(p.competence_date, p.due_date) >= @start
                                  AND COALESCE(p.competence_date, p.due_date) <= @end
                                GROUP BY p.category_id
                                ORDER BY Total DESC
                                LIMIT 12;
                                ";

            await using var conn = await _context.OpenConnectionAsync();

            var multi = await conn.QueryMultipleAsync(sql, new
            {
                start,
                end,
                catActs = _opt.CategoryActs,
                catInstall = _opt.CategoryInstallments
            });

            // 1) vendas
            var vendasQtd = await multi.ReadFirstAsync<int>();

            // 2) ato
            var ato = await multi.ReadFirstAsync<decimal>();

            // 3) parcelas
            var parcelas = await multi.ReadFirstAsync<decimal>();

            // 4) despesas total
            var despesasTotal = await multi.ReadFirstAsync<decimal>();

            // 5) inad (mês)
            var inadMesRow = await multi.ReadFirstAsync<(int QtdMes, int EmAbertoMes, decimal RecebidosNoMes, int PagantesNoMes)>();
            var qtdMes = inadMesRow.QtdMes;
            var emAbertoMes = inadMesRow.EmAbertoMes;
            var recebidosNoMes = inadMesRow.RecebidosNoMes;
            var pagantesNoMes = inadMesRow.PagantesNoMes;

            // 6) inad (geral)
            var inadTotalRow = await multi.ReadFirstAsync<(int TotalAteFim, int EmAbertoTotal, decimal ValorAberto)>();
            var totalAteFim = inadTotalRow.TotalAteFim;
            var emAbertoTotal = inadTotalRow.EmAbertoTotal;
            var valorAberto = inadTotalRow.ValorAberto;

            // 7) vendas por corretor
            var vendasSerie = (await multi.ReadAsync<(string Label, int Qtd)>()).ToList();

            // 8) despesas por categoria
            var despesasSerie = (await multi.ReadAsync<(string Label, decimal Total)>()).ToList();

            // KPIs derivadas
            var receitaBruta = ato + parcelas;
            var receitaLiquida = receitaBruta - despesasTotal;

            decimal inadPctMes = 0m;
            if (qtdMes > 0) inadPctMes = Math.Round((decimal)emAbertoMes / qtdMes * 100m, 2);

            decimal inadPctTotal = 0m;
            if (totalAteFim > 0) inadPctTotal = Math.Round((decimal)emAbertoTotal / totalAteFim * 100m, 2);

            return new DashboardResponse
            {
                VendasQtd = vendasQtd,
                DespesasTotal = despesasTotal,
                Ato = ato,
                Parcelas = parcelas,
                ReceitaBruta = receitaBruta,
                ReceitaLiquida = receitaLiquida,

                Inad_pctMes = inadPctMes,
                Inad_pctTotal = inadPctTotal,
                Inad_pagantes = pagantesNoMes,
                Inad_recebidos = recebidosNoMes,
                Inad_qtdMes = qtdMes,
                Inad_valorAberto = valorAberto,

                Vendas = new SeriesData
                {
                    Labels = vendasSerie.Select(x => x.Label).ToList(),
                    Values = vendasSerie.Select(x => (decimal)x.Qtd).ToList()
                },
                Despesas = new SeriesData
                {
                    Labels = despesasSerie.Select(x => x.Label).ToList(),
                    Values = despesasSerie.Select(x => x.Total).ToList()
                }
            };
        }

        public async Task<IEnumerable<VendasV2>> GetAllAsync()
        {
            var sql = "SELECT * FROM jmoficial.sale";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<VendasV2>(sql);
        }

        public async Task<IEnumerable<VendasV2>> GetAllByDateAsync(string? startAt = null, string? finishAt = null, int enterpriseId = 0, int filialId = 0, int clienteId = 0, string status = "ABC", int managerId = 0)
        {
            DateTime? startDate = null;
            DateTime? finishDate = null;

            if (!string.IsNullOrEmpty(startAt))
            {
                startDate = DateTime.Parse(startAt);
            }

            if (!string.IsNullOrEmpty(finishAt))
            {
                finishDate = DateTime.Parse(finishAt);
            }

            string query = @"SELECT DISTINCT T0.*, T7.number as ""UnitName"", T6.name as ""BranchName"", 
                                    T5.name as ""EnterpriseName"",
                                    GROUP_CONCAT(DISTINCT T2.name ORDER BY T2.name SEPARATOR ', ') AS ""Cliente"", 
                                    T30.name AS ""Coordenador"", 
                                    T3.name AS ""Gerente"", 
                                    T4.name as ""Corretor"" 
                                    from jmoficial.sales T0                                    
                                    LEFT JOIN jmoficial.sale_customers T1 ON T0.id = T1.sale_id 
                                    LEFT JOIN jmoficial.customers T2 ON T1.customer_id = T2.id 
                                    LEFT JOIN jmoficial.users T3 ON T0.manager_id = T3.id 
                                    LEFT JOIN jmoficial.users T30 ON T0.coordenator_id = T30.id 
                                    LEFT JOIN jmoficial.users T4 ON T0.realtor_id = T4.id 
                                    LEFT JOIN jmoficial.enterprises T5 ON T0.enterprise_id = T5.id 
                                    LEFT JOIN jmoficial.branches T6 ON T0.branch_id = T6.id 
                                    LEFT JOIN jmoficial.units T7 ON T0.unit_id = T7.id 
                                WHERE 
                                    (@StartAt IS NULL OR T0.selled_at >= @StartAt) 
                                    AND (@FinishAt IS NULL OR T0.selled_at <= @FinishAt) 
                                    AND (@EnterpriseId = 0 OR T0.enterprise_id = @EnterpriseId)
                                    AND (@FilialId = 0 OR T0.branch_id = @FilialId)
                                    AND (@ManagerId = 0 OR T0.manager_id = @ManagerId)
                                    AND (@Status = 'ABC' OR T0.status = @Status)
                                GROUP BY T0.id;";


            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<VendasV2>(query, new
            {
                StartAt = startDate,
                FinishAt = finishDate,
                EnterpriseId = enterpriseId,
                FilialId = filialId,
                ManagerId = managerId,
                ClienteId = clienteId,
                Status = status
            });
        }


        public async Task<VendasV2?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM jmoficial.sales WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<VendasV2>(sql, new { id });
        }

        public async Task<int> CreateAsync(VendasV2 entity)
        {
            string query = @" INSERT INTO jmoficial.sales (unit_value, start_value, value_to_constructor,
            percentage_to_realtor, percentage_to_manager, parcels_start,
            realtor_comission, realtor_comission_remaining, realtor_comission_status, manager_comission,  manager_comission_remaining,
            manager_comission_status, generate_notification,  notificated_date,
            net_earnings, gross_earnings, contract_path, status, branch_id, enterprise_id,
            unit_id, realtor_id, manager_id, payment_types_id,
            selled_at, deleted_at, created_at,  updated_at, value_to_realstate, percentage_to_realstate,
            percentage_to_financial, financial_comission, financial_comission_status, percentage_to_tax,
            tax_comission, tax_comission_status,
            contract_number, customer_id, coordenator_id
        )
        VALUES 
        (
            @UnitValue,
            @StartValue,
            @ValueToConstructor,
            @PercentageToRealtor,
            @PercentageToManager,
            @ParcelsStart,
            @RealtorComission,
            @RealtorComissionRemaining,
            @RealtorComissionStatus,
            @ManagerComission,
            @ManagerComissionRemaining,
            @ManagerComissionStatus,
            @GenerateNotification,
            @NotificatedDate,
            @NetEarnings,
            @GrossEarnings,
            @ContractPath,
            @Status,
            @BranchId,
            @EnterpriseId,
            @UnitId,
            @RealtorId,
            @ManagerId,
            @PaymentTypesId,
            @SelledAt,
            @DeletedAt,
            @CreatedAt,
            @UpdatedAt,
            @ValueToRealstate,
            @PercentageToRealstate,
            @PercentageToFinancial,
            @FinancialComission,
            @FinancialComissionStatus,
            @PercentageToTax,
            @TaxComission,
            @TaxComissionStatus,
            @ContractNumber,
            @CustomerId,
            @CoordenatorId

        );
            SELECT LAST_INSERT_ID();
        ";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(query, entity);
        }

        public async Task<List<int>> GetCustomerIdsBySaleIdAsync(int saleId)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var sql = @"
            SELECT sc.customer_id
            FROM jmoficial.sale_customers sc
            WHERE sc.sale_id = @SaleId
              AND sc.deleted_at IS NULL
            ORDER BY sc.id;";

            var ids = await conn.QueryAsync<int>(sql, new { SaleId = saleId });
            return ids.ToList();
        }

        private const string SaleSourceType = "App\\Models\\Sale\\Sale";

        public async Task<List<ParcelDto>> GetParcelsBySaleIdAsync(int saleId)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var sql = @"
            SELECT
                id,
                `number`       AS Number,
                value          AS Value,
                `date`         AS Date,
                observations   AS Observations,
                status         AS Status,
                `type`         AS Type,
                paid_date      AS PaidDate
            FROM jmoficial.parcels
            WHERE source_id = @SaleId
              AND source_type = @SourceType
              AND deleted_at IS NULL
            ORDER BY `date`, `number`, id;
        ";

            var rows = await conn.QueryAsync<ParcelDto>(sql, new { SaleId = saleId, SourceType = SaleSourceType });
            return rows.ToList();
        }

        public async Task<bool> UpdateAsync(VendasV2 entity)
        {
            string query = @" UPDATE jmoficial.sales 
                              SET 
                                unit_value = @UnitValue,
                                start_value = @StartValue,
                                value_to_constructor = @ValueToConstructor,
                                percentage_to_realtor = @PercentageToRealtor,
                                percentage_to_manager = @PercentageToManager,
                                parcels_start = @ParcelsStart,
                                realtor_comission = @RealtorComission,
                                realtor_comission_remaining = @RealtorComissionRemaining,
                                realtor_comission_status = @RealtorComissionStatus,
                                manager_comission = @ManagerComission,
                                manager_comission_remaining = @ManagerComissionRemaining,
                                manager_comission_status = @ManagerComissionStatus,
                                generate_notification = @GenerateNotification,
                                notificated_date = @NotificatedDate,
                                net_earnings = @NetEarnings,
                                gross_earnings = @GrossEarnings,
                                contract_path = @ContractPath,
                                status = @Status,
                                branch_id = @BranchId,
                                enterprise_id = @EnterpriseId,
                                unit_id = @UnitId,
                                realtor_id = @RealtorId,
                                manager_id = @ManagerId,
                                payment_types_id = @PaymentTypesId,
                                selled_at = @SelledAt,
                                deleted_at = @DeletedAt,
                                created_at = @CreatedAt,
                                updated_at = @UpdatedAt,
                                value_to_realstate = @ValueToRealstate,
                                percentage_to_realstate = @PercentageToRealstate,
                                percentage_to_financial = @PercentageToFinancial,
                                financial_comission = @FinancialComission,
                                financial_comission_status = @FinancialComissionStatus,
                                percentage_to_tax = @PercentageToTax,
                                tax_comission = @TaxComission,
                                tax_comission_status = @TaxComissionStatus,
                                contract_number = @ContractNumber
                            WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(query, entity) > 0;
        }

        public async Task<bool> RegistrarAtoAsync(long vendaId)
        {
            const string sql = @"UPDATE jmoficial.sales
                                 SET status = 'VENDIDO',
                                     updated_at = UTC_TIMESTAMP()
                                 WHERE id = @vendaId
                                   AND UPPER(status) IN ('RESERVED', 'RESERVADO');";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { vendaId }) > 0;
        }

        public async Task<bool> AtualizarStatusUnidadeAsync(long unidadeId, string status)
        {
            const string sql = @"UPDATE jmoficial.units
                                 SET status = @status,
                                     updated_at = UTC_TIMESTAMP()
                                 WHERE id = @unidadeId;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { unidadeId, status = status.ToUpperInvariant() }) > 0;
        }
        public async Task<VendasV2?> GetSaleFullAsync(int saleId, FinanceMappingOptions map)
        {
            const string sql = @"
                                    -- 1) Sale
                                    SELECT 
                                        T0.id                 AS Id,
                                        unit_value         AS UnitValue,
                                        start_value        AS StartValue,
                                        value_to_constructor AS ValueToConstructor,
                                        percentage_to_realtor AS PercentageToRealtor,
                                        percentage_to_manager AS PercentageToManager,
                                        parcels_start      AS ParcelsStart,
                                        realtor_comission  AS RealtorComission,
                                        realtor_comission_remaining AS RealtorComissionRemaining,
                                        realtor_comission_status    AS RealtorComissionStatus,
                                        manager_comission  AS ManagerComission,
                                        manager_comission_remaining AS ManagerComissionRemaining,
                                        manager_comission_status    AS ManagerComissionStatus,
                                        generate_notification       AS GenerateNotification,
                                        notificated_date   AS NotificatedDate,
                                        net_earnings       AS NetEarnings,
                                        gross_earnings     AS GrossEarnings,
                                        contract_path      AS ContractPath,
                                        status             AS Status,
                                        branch_id          AS BranchId,
                                        enterprise_id      AS EnterpriseId,
                                        unit_id            AS UnitId,
                                        realtor_id         AS RealtorId,
                                        manager_id         AS ManagerId,
                                        payment_types_id   AS PaymentTypesId,
                                        selled_at          AS SelledAt,
                                        T0.deleted_at         AS DeletedAt,
                                        T0.created_at         AS CreatedAt,
                                        T0.updated_at         AS UpdatedAt,
                                        value_to_realstate AS ValueToRealstate,
                                        percentage_to_realstate AS PercentageToRealstate,
                                        percentage_to_financial   AS PercentageToFinancial,
                                        financial_comission       AS FinancialComission,
                                        financial_comission_status AS FinancialComissionStatus,
                                        percentage_to_tax         AS PercentageToTax,
                                        tax_comission             AS TaxComission,
                                        tax_comission_status      AS TaxComissionStatus,
                                        customer_id               AS CustomerId, 
                                        coordenator_id            AS CoordenatorId,
                                        contract_number           AS ContractNumber,
                                        coordenator_comission_status as CoordenatorComissionStatus,
                                        coordenator_comission AS CoordenatorComission,
                                        percentage_to_coordenator  AS PercentageToCoordenator,
    
                                        T1.name AS Cliente, 
                                        T1.email AS EmailCustomer,
                                        T1.cellphone AS PhoneCustomer, 
                                        T1.cpf_cnpj AS CpfCnpj                                        
                                        
                                    FROM jmoficial.sales T0
                                    LEFT JOIN jmoficial.customers T1 ON T0.customer_id = T1.id
                                    WHERE T0.id = @SaleId;

                                    -- 2) Acts (em receivables por categoria de atos, cost_center 1, reference = SALE:{id})
                                    SELECT 
                                        r.installment_no AS Parcel,
                                        r.amount         AS Value,
                                        r.due_date       AS Date,
                                        r.notes          AS Observations,
                                        NULL             AS SourceId,
                                        r.status         AS Status,
                                        NULL             AS PaymentId,
                                        r.received_date  AS PaidDate,
                                        r.id             AS Id
                                    FROM jmoficial.receivables r
                                    WHERE r.reference = CONCAT('SALE:', @SaleId)
                                      AND r.typeParcel = 'ACT';

                                    -- 3) Parcelas/Intermediárias do cliente (em receivables por categoria de parcelas)
                                    SELECT 
                                        r.id             AS Id,
                                        r.amount         AS VlrInstallament,
                                        DATE_FORMAT(r.due_date, '%Y-%m-%d') AS DueDate,
                                        DATE_FORMAT(r.received_date, '%Y-%m-%d') AS DtPayment,
                                        r.notes          AS Obs,
                                        r.status         AS Status,
                                        r.description    AS Description
                                    FROM jmoficial.receivables r
                                    WHERE r.reference = CONCAT('SALE:', @SaleId)
                                       AND r.typeParcel IN ('PAR', 'INT')
                                    ORDER BY r.installment_no;


                                    -- 4) Comissão Corretor (parcelada ou não) em payables
                                    SELECT
                                        p.id             AS Id,
                                        p.installment_no AS IdInstallment,
                                        p.amount         AS VlrInstallament,
                                        DATE_FORMAT(p.due_date, '%Y-%m-%d') AS DueDate,
                                        DATE_FORMAT(p.paid_date, '%Y-%m-%d') AS DtPayment,
                                        p.notes          AS Obs,
                                        p.status         AS Status
                                    FROM jmoficial.payables p
                                    WHERE p.reference = CONCAT('SALE:', @SaleId)
                                      AND p.category_id = @CategoryRealtor
                                    ORDER BY p.installment_no;

                                    -- 5) Comissão Gerente em payables
                                    SELECT
                                        p.id             AS Id,
                                        p.installment_no AS IdInstallment,
                                        p.amount         AS VlrInstallament,
                                        DATE_FORMAT(p.due_date, '%Y-%m-%d') AS DueDate,
                                        DATE_FORMAT(p.paid_date, '%Y-%m-%d') AS DtPayment,
                                        p.notes          AS Obs,
                                        p.status         AS Status
                                    FROM jmoficial.payables p
                                    WHERE p.reference = CONCAT('SALE:', @SaleId)
                                      AND p.category_id = @CategoryManager
                                    ORDER BY p.installment_no;
                                    ";

            using var conn = await _context.OpenConnectionAsync();

            using var gr = await conn.QueryMultipleAsync(sql, new
            {
                SaleId = saleId,
                CategoryActs = map.CategoryActs,
                CategoryInstallments = map.CategoryInstallments,
                CategoryRealtor = map.CategoryRealtor,
                CategoryManager = map.CategoryManager,
                CostCenterActs = map.CostCenterActs
            });

            var sale = await gr.ReadSingleOrDefaultAsync<VendasV2>();
            if (sale is null) return null;

            var acts = (await gr.ReadAsync<Acts>()).Cast<Acts?>().ToList();

            var receivablesInst = (await gr.ReadAsync<_ReceivableInstallView>()).ToList();

            // Separa por descrição (você gerou "Parcela N - ..." e "Intermediária N - ...")
            var parcelas = receivablesInst
                                        .Where(x => x.Description != null && x.Description.StartsWith("Parcela", StringComparison.OrdinalIgnoreCase))
                                        .Select(x => new Installaments
                                        {
                                            Id = null,
                                            VlrInstallament = x.VlrInstallament,
                                            DueDate = x.DueDate,
                                            DtPayment = x.DtPayment,
                                            Obs = x.Obs,
                                            Status = x.Status
                                        })
                                        .Cast<Installaments?>()
                                        .ToList();

            var intermediarias = receivablesInst
                .Where(x => x.Description != null && x.Description.StartsWith("Intermediária", StringComparison.OrdinalIgnoreCase))
                .Select(x => new Installaments
                {
                    Id = null,
                    VlrInstallament = x.VlrInstallament,
                    DueDate = x.DueDate,
                    DtPayment = x.DtPayment,
                    Obs = x.Obs,
                    Status = x.Status
                })
                .Cast<Installaments?>()
                .ToList();

            // Corretor
            var corretor = (await gr.ReadAsync<_PayableInstallView>()).Select(x => new Installaments
            {
                Id = x.IdInstallment,
                VlrInstallament = x.VlrInstallament,
                DueDate = x.DueDate,
                DtPayment = x.DtPayment,
                Obs = x.Obs,
                Status = x.Status
            }).Cast<Installaments?>().ToList();

            // Gerente
            var gerente = (await gr.ReadAsync<_PayableInstallView>()).Select(x => new Installaments
            {
                Id = x.IdInstallment,
                VlrInstallament = x.VlrInstallament,
                DueDate = x.DueDate,
                DtPayment = x.DtPayment,
                Obs = x.Obs,
                Status = x.Status
            }).Cast<Installaments?>().ToList();

            // Preenche o objeto final
            sale.Acts = acts;
            sale.Parcelas = parcelas;
            sale.Intermediarias = intermediarias;
            sale.PlainCorretor = corretor;
            sale.PlainManager = gerente;

            return sale;


        }
        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM jmoficial.sales WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }

        public async Task<long> CreateAsync(Proposal proposal, IEnumerable<ProposalCondition> conds, CancellationToken ct)
        {
            proposal.Status = ProposalStatus.EM_ANALISE.ToString();

            const string sqlInsertProposal = @"INSERT INTO jmoficial.proposals
                                                (empreendimento_id, unidade_id, vlr_unidade, eng_caixa,
                                                 cliente_name, date_nascimento, cnpj_cpf, rg, email_cliente, phone_one, phone_two, estado_civil, profissao, renda,
                                                 cliente_name_secondary, data_nascimento_secondary, cnpj_cpf_secondary, rg_secondary, email_cliente_secondary, phone_one_secondary, phone_two_secondary, estado_civil_secondary, profissao_secondary, renda_secondary,
                                                 cep, rua, nro, comp, bairro, cidade, estado,
                                                 corretor_id, gerente_id, coordenador_id, status)
                                                VALUES
                                                (@EmpreendimentoId, @UnidadeId, @VlrUnidade, @EngCaixa,
                                                 @ClienteName, @DateNascimento, @CnpjCpf, @Rg, @EmailCliente, @PhoneOne, @PhoneTwo, @EstadoCivil, @Profissao, @Renda,
                                                 @ClienteNameSecondary, @DataNascimentoSecondary, @CnpjCpfSecondary, @RgSecondary, @EmailClienteSecondary, @PhoneOneSecondary, @PhoneTwoSecondary, @EstadoCivilSecondary, @ProfissaoSecondary, @RendaSecondary,
                                                 @Cep, @Rua, @Nro, @Comp, @Bairro, @Cidade, @Estado,
                                                 @CorretorId, @GerenteId, @CoordenadorId, @Status);
                                                SELECT LAST_INSERT_ID();";

            const string sqlInsertCond = @"INSERT INTO proposal_conditions
                                        (proposal_id, qtde, descricao, vencimento, valor_parcela, valor_total)
                                        VALUES
                                        (@ProposalId, @Qtde, @Descricao, @Vencimento, @ValorParcela, @ValorTotal);";

            const string sqlReserveUnit = @"UPDATE jmoficial.units
                                            SET status = 'RESERVED',
                                                updated_at = UTC_TIMESTAMP()
                                            WHERE id = @UnidadeId
                                              AND active = 1
                                              AND deleted_at IS NULL
                                              AND UPPER(status) = 'OPEN';";

            using var conn = await _context.OpenConnectionAsync();
            using var tx = await conn.BeginTransactionAsync(ct);

            try
            {
                var reserved = await conn.ExecuteAsync(new CommandDefinition(
                    sqlReserveUnit,
                    new { proposal.UnidadeId },
                    tx,
                    cancellationToken: ct));

                if (reserved == 0)
                {
                    await tx.RollbackAsync(ct);
                    throw new InvalidOperationException("Unidade indisponivel para proposta.");
                }

                var newId = await conn.ExecuteScalarAsync<ulong>(new CommandDefinition(
                    sqlInsertProposal, proposal, tx, cancellationToken: ct));

                foreach (var c in conds)
                {
                    c.ProposalId = newId;
                    await conn.ExecuteAsync(new CommandDefinition(
                        sqlInsertCond, c, tx, cancellationToken: ct));
                }


                await tx.CommitAsync(ct);
                return (long)newId;
            }
            catch
            {
                await tx.RollbackAsync(ct);
                throw;
            }
        }
        public async Task<bool> UpdateProposalAsync(Proposal proposal, IEnumerable<ProposalCondition> conds, CancellationToken ct)
        {
            const string sqlUpdateProposal = @"UPDATE jmoficial.proposals
                                              SET empreendimento_id = @EmpreendimentoId,
                                                  unidade_id = @UnidadeId,
                                                  vlr_unidade = @VlrUnidade,
                                                  eng_caixa = @EngCaixa,
                                                  cliente_name = @ClienteName,
                                                  date_nascimento = @DateNascimento,
                                                  cnpj_cpf = @CnpjCpf,
                                                  rg = @Rg,
                                                  email_cliente = @EmailCliente,
                                                  phone_one = @PhoneOne,
                                                  phone_two = @PhoneTwo,
                                                  estado_civil = @EstadoCivil,
                                                  profissao = @Profissao,
                                                  renda = @Renda,
                                                  cliente_name_secondary = @ClienteNameSecondary,
                                                  data_nascimento_secondary = @DataNascimentoSecondary,
                                                  cnpj_cpf_secondary = @CnpjCpfSecondary,
                                                  rg_secondary = @RgSecondary,
                                                  email_cliente_secondary = @EmailClienteSecondary,
                                                  phone_one_secondary = @PhoneOneSecondary,
                                                  phone_two_secondary = @PhoneTwoSecondary,
                                                  estado_civil_secondary = @EstadoCivilSecondary,
                                                  profissao_secondary = @ProfissaoSecondary,
                                                  renda_secondary = @RendaSecondary,
                                                  cep = @Cep,
                                                  rua = @Rua,
                                                  nro = @Nro,
                                                  comp = @Comp,
                                                  bairro = @Bairro,
                                                  cidade = @Cidade,
                                                  estado = @Estado,
                                                  corretor_id = @CorretorId,
                                                  gerente_id = @GerenteId,
                                                  coordenador_id = @CoordenadorId,
                                                  status = @Status,
                                                  updated_at = UTC_TIMESTAMP()
                                              WHERE id = @Id
                                                AND deleted_at IS NULL;";

            const string sqlDeleteConds = @"DELETE FROM jmoficial.proposal_conditions WHERE proposal_id = @Id;";

            const string sqlInsertCond = @"INSERT INTO jmoficial.proposal_conditions
                                           (proposal_id, qtde, descricao, vencimento, valor_parcela, valor_total)
                                           VALUES
                                           (@ProposalId, @Qtde, @Descricao, @Vencimento, @ValorParcela, @ValorTotal);";

            using var conn = await _context.OpenConnectionAsync();
            using var tx = await conn.BeginTransactionAsync(ct);

            try
            {
                var affected = await conn.ExecuteAsync(new CommandDefinition(
                    sqlUpdateProposal, proposal, tx, cancellationToken: ct));

                if (affected == 0)
                {
                    await tx.RollbackAsync(ct);
                    return false;
                }

                await conn.ExecuteAsync(new CommandDefinition(
                    sqlDeleteConds, new { proposal.Id }, tx, cancellationToken: ct));

                foreach (var c in conds)
                {
                    c.ProposalId = (ulong)proposal.Id;
                    await conn.ExecuteAsync(new CommandDefinition(
                        sqlInsertCond, c, tx, cancellationToken: ct));
                }

                await tx.CommitAsync(ct);
                return true;
            }
            catch
            {
                await tx.RollbackAsync(ct);
                throw;
            }
        }
        public async Task<Proposal?> GetByIdAsync(long id, CancellationToken ct)
        {

            const string sqlP = @"select T1.name as ""EnterPriseName"", CONCAT('Apto ',T2.number,' ',T2.block) as ""UnitName"", T0.cliente_name as ""ClienteName"", T0.* from proposals T0
                                LEFT JOIN enterprises T1 ON T0.empreendimento_id = T1.id
                                LEFT JOIN units T2 ON T0.unidade_id = T2.id and T2.enterprise_id = T1.id
                                WHERE T0.id = @id AND T0.deleted_at IS NULL;";

            const string sqlC = @"SELECT * FROM jmoficial.proposal_conditions WHERE proposal_id = @id ORDER BY vencimento ASC, id ASC;";

            using var conn = await _context.OpenConnectionAsync();
            var p = await conn.QuerySingleOrDefaultAsync<Proposal>(new CommandDefinition(sqlP, new { id }, cancellationToken: ct));
            if (p is null) return null;

            var conds = await conn.QueryAsync<ProposalCondition>(new CommandDefinition(sqlC, new { id }, cancellationToken: ct));
            p.Condicao = conds.ToList();
            return p;
        }
        public async Task<IEnumerable<Proposal>> ListAsync(DateTime? de, DateTime? ate, string? status, int? user, int? gerente, int? coordenador, int? corretor, int? construtora, int? empreendimento, CancellationToken ct)
        {
            var sql = @"select T1.name as ""EnterPriseName"",
                               CONCAT('Apto ',T2.number,' ',T2.block) as ""UnitName"",
                               U.name as ""CorretorNome"",
                               T0.cliente_name as ""ClienteName"",
                               T0.*
                        from proposals T0
                        LEFT JOIN enterprises T1 ON T0.empreendimento_id = T1.id
                        LEFT JOIN units T2 ON T0.unidade_id = T2.id and T2.enterprise_id = T1.id
                        LEFT JOIN users U ON T0.corretor_id = U.id
                        WHERE T0.deleted_at IS NULL ";

            var dp = new DynamicParameters();

            if (de.HasValue)
            {
                sql += " AND T0.created_at >= @de ";
                dp.Add("@de", de.Value);
            }
            if (ate.HasValue)
            {
                sql += " AND T0.created_at < @ate ";
                dp.Add("@ate", ate.Value);
            }
            if (!string.IsNullOrWhiteSpace(status))
            {
                sql += " AND UPPER(T0.status) IN @statuses ";
                dp.Add("@statuses", GetEquivalentProposalStatuses(status));
            }
            if (user.HasValue)
            {
                sql += " AND T0.corretor_id = @user ";
                dp.Add("@user", user.Value);
            }
            if (gerente.HasValue)
            {
                sql += " AND T0.gerente_id = @gerente ";
                dp.Add("@gerente", gerente.Value);
            }
            if (coordenador.HasValue)
            {
                sql += " AND T0.coordenador_id = @coordenador ";
                dp.Add("@coordenador", coordenador.Value);
            }
            if (corretor.HasValue)
            {
                sql += " AND T0.corretor_id = @corretor ";
                dp.Add("@corretor", corretor.Value);
            }
            if (construtora.HasValue)
            {
                sql += " AND T1.constructor_id = @construtora ";
                dp.Add("@construtora", construtora.Value);
            }
            if (empreendimento.HasValue)
            {
                sql += " AND T0.empreendimento_id = @empreendimento ";
                dp.Add("@empreendimento", empreendimento.Value);
            }

            sql += " ORDER BY created_at DESC, id DESC LIMIT 500;"; // ajuste paginação se desejar

            using var conn = await _context.OpenConnectionAsync();
            var list = await conn.QueryAsync<Proposal>(new CommandDefinition(sql, dp, cancellationToken: ct));
            return list;
        }
        public async Task<bool> UpdateUnitStatusAsync(long unitId, string nextStatus, CancellationToken ct)
        {
            const string sql = @"UPDATE jmoficial.units
                                 SET status = @nextStatus,
                                     updated_at = UTC_TIMESTAMP()
                                 WHERE id = @unitId;";

            using var conn = await _context.OpenConnectionAsync();
            var affected = await conn.ExecuteAsync(new CommandDefinition(
                sql,
                new { unitId, nextStatus = nextStatus.ToUpperInvariant() },
                cancellationToken: ct));

            return affected > 0;
        }

        public async Task<string?> GetUnitStatusAsync(long unitId, CancellationToken ct)
        {
            const string sql = @"SELECT status
                                 FROM jmoficial.units
                                 WHERE id = @unitId
                                   AND deleted_at IS NULL
                                   AND active = 1;";

            using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<string?>(new CommandDefinition(
                sql,
                new { unitId },
                cancellationToken: ct));
        }

        public async Task<bool> HasActiveProposalForUnitAsync(long unitId, CancellationToken ct)
        {
            const string sql = @"SELECT COUNT(1)
                                 FROM jmoficial.proposals
                                 WHERE unidade_id = @unitId
                                   AND deleted_at IS NULL
                                   AND UPPER(status) IN ('EM_ANALISE', 'APROVADO');";

            using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(new CommandDefinition(
                sql,
                new { unitId },
                cancellationToken: ct)) > 0;
        }

        public async Task<bool> UpdateProposalStatusAsync(long id, string expectedStatus, string nextStatus, CancellationToken ct)
        {
            const string sql = @"UPDATE jmoficial.proposals
                                 SET status = @nextStatus,
                                     updated_at = UTC_TIMESTAMP()
                                 WHERE id = @id
                                   AND deleted_at IS NULL;";

            using var conn = await _context.OpenConnectionAsync();
            var affected = await conn.ExecuteAsync(new CommandDefinition(
                sql,
                new
                {
                    id,
                    nextStatus = nextStatus.ToUpperInvariant()
                },
                cancellationToken: ct));

            return affected > 0;
        }

        private static string[] GetEquivalentProposalStatuses(string status)
        {
            return status.Trim().ToUpperInvariant() switch
            {
                "RASCUNHO" => new[] { "RASCUNHO", "OPEN", "RESERVED" },
                "EM_ANALISE" or "EM_ANÁLISE" or "EM ANALISE" or "EM ANÁLISE" => new[] { "EM_ANALISE", "EM_ANÁLISE", "EM ANALISE", "EM ANÁLISE", "IN_ANALISE", "IN_ANALYSIS" },
                "APROVADO" => new[] { "APROVADO", "APPROVED" },
                "REPROVADO" => new[] { "REPROVADO", "REJECTED" },
                "CANCELADO" => new[] { "CANCELADO", "CANCELLED" },
                _ => new[] { status.Trim().ToUpperInvariant() }
            };
        }
    }
}







