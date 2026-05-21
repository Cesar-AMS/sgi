using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using System.Text;

namespace JMImoveisAPI.Repositories
{
    public class AtendimentoRelatorioRepository : IAtendimentoRelatorioRepository
    {
        private readonly DapperContext _context;

        public AtendimentoRelatorioRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<AtendimentoRelatorioResponse> GetResumoAsync(
            DateTime? startAt,
            DateTime? finishAt,
            int? vendedorId,
            int? coordenadorId,
            int? gerenteId,
            long currentUserId,
            bool canViewAll)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var leads = (await conn.QueryAsync<LeadReportRow>(
                BuildLeadsSql(canViewAll, vendedorId, coordenadorId, gerenteId, startAt, finishAt),
                BuildParameters(startAt, finishAt, vendedorId, coordenadorId, gerenteId, currentUserId)))
                .ToList();

            var agendamentos = (await conn.QueryAsync<ScheduleReportRow>(
                BuildSchedulesSql("contato", canViewAll, vendedorId, coordenadorId, gerenteId, startAt, finishAt),
                BuildParameters(startAt, finishAt, vendedorId, coordenadorId, gerenteId, currentUserId, "contato")))
                .ToList();

            var visitas = (await conn.QueryAsync<ScheduleReportRow>(
                BuildSchedulesSql("visita", canViewAll, vendedorId, coordenadorId, gerenteId, startAt, finishAt),
                BuildParameters(startAt, finishAt, vendedorId, coordenadorId, gerenteId, currentUserId, "visita")))
                .ToList();

            var response = new AtendimentoRelatorioResponse();

            response.Resumo = BuildResumo(leads, agendamentos, visitas);
            response.Conversoes = BuildConversoes(response.Resumo);
            response.Agrupamentos = BuildAgrupamentos(leads, agendamentos, visitas);

            response.FunilPorVendedor = BuildFunilPorVendedor(leads, agendamentos, visitas);
            response.FunilPorCoordenador = BuildFunilPorEquipe(
                "Sem coordenador",
                leads.Select(l => new TeamLeadRow(l.CoordenadorNome, l)),
                agendamentos.Select(a => new TeamScheduleRow(a.CoordenadorNome, a)),
                visitas.Select(v => new TeamScheduleRow(v.CoordenadorNome, v)));

            response.FunilPorGerente = BuildFunilPorEquipe(
                "Sem gerente",
                leads.Select(l => new TeamLeadRow(l.GerenteNome, l)),
                agendamentos.Select(a => new TeamScheduleRow(a.GerenteNome, a)),
                visitas.Select(v => new TeamScheduleRow(v.GerenteNome, v)));

            response.Rankings = BuildRankings(response.FunilPorVendedor);

            return response;
        }

        private static DynamicParameters BuildParameters(
            DateTime? startAt,
            DateTime? finishAt,
            int? vendedorId,
            int? coordenadorId,
            int? gerenteId,
            long currentUserId,
            string? tipoAgenda = null)
        {
            var p = new DynamicParameters();

            if (startAt.HasValue) p.Add("startAt", startAt.Value);
            if (finishAt.HasValue) p.Add("finishAt", finishAt.Value);
            if (vendedorId.HasValue) p.Add("vendedorId", vendedorId.Value);
            if (coordenadorId.HasValue) p.Add("coordenadorId", coordenadorId.Value);
            if (gerenteId.HasValue) p.Add("gerenteId", gerenteId.Value);

            p.Add("currentUserId", currentUserId);

            if (!string.IsNullOrWhiteSpace(tipoAgenda))
            {
                p.Add("tipoAgenda", tipoAgenda);
            }

            return p;
        }

        private static string BuildLeadsSql(
            bool canViewAll,
            int? vendedorId,
            int? coordenadorId,
            int? gerenteId,
            DateTime? startAt,
            DateTime? finishAt)
        {
            var sql = new StringBuilder(@"
        SELECT
            l.Id,
            l.Status,
            l.EtapaAtendimento,
            l.DataCriacao,
            COALESCE(vendedor.name, NULLIF(l.Vendedor, ''), 'Sem vendedor') AS VendedorNome,
            COALESCE(coordenador.name, NULLIF(l.Coordenador, ''), 'Sem coordenador') AS CoordenadorNome,
            COALESCE(gerente.name, NULLIF(l.Gerente, ''), 'Sem gerente') AS GerenteNome
        FROM leads l
        LEFT JOIN users vendedor
            ON vendedor.id = NULLIF(CAST(l.Vendedor AS UNSIGNED), 0)
            OR vendedor.name COLLATE utf8mb4_unicode_ci = l.Vendedor COLLATE utf8mb4_unicode_ci
        LEFT JOIN users coordenador
            ON coordenador.id = NULLIF(CAST(l.Coordenador AS UNSIGNED), 0)
            OR coordenador.name COLLATE utf8mb4_unicode_ci = l.Coordenador COLLATE utf8mb4_unicode_ci
            OR coordenador.id = NULLIF(vendedor.coordenator_id, 0)
        LEFT JOIN users gerente
            ON gerente.id = NULLIF(CAST(l.Gerente AS UNSIGNED), 0)
            OR gerente.name COLLATE utf8mb4_unicode_ci = l.Gerente COLLATE utf8mb4_unicode_ci
            OR gerente.id = NULLIF(vendedor.manager_id, 0)
            OR gerente.id = NULLIF(coordenador.manager_id, 0)
        WHERE 1 = 1
    ");

            if (startAt.HasValue)
                sql.Append(" AND l.DataCriacao >= @startAt");

            if (finishAt.HasValue)
                sql.Append(" AND l.DataCriacao <= @finishAt");

            if (vendedorId.HasValue)
                sql.Append(" AND vendedor.id = @vendedorId");

            if (coordenadorId.HasValue)
                sql.Append(" AND coordenador.id = @coordenadorId");

            if (gerenteId.HasValue)
                sql.Append(" AND gerente.id = @gerenteId");

            if (!canViewAll)
            {
                sql.Append(@"
            AND (
                vendedor.id = @currentUserId
                OR coordenador.id = @currentUserId
                OR gerente.id = @currentUserId
                OR NULLIF(vendedor.gestor_id, 0) = @currentUserId
                OR NULLIF(coordenador.gestor_id, 0) = @currentUserId
                OR NULLIF(gerente.gestor_id, 0) = @currentUserId
            )
        ");
            }

            return sql.ToString();
        }

        private static string BuildSchedulesSql(
            string tipoAgenda,
            bool canViewAll,
            int? vendedorId,
            int? coordenadorId,
            int? gerenteId,
            DateTime? startAt,
            DateTime? finishAt)
        {
            var sql = new StringBuilder(@"
                SELECT
                    ls.Id,
                    ls.Status,
                    IFNULL(ls.TipoAgenda, 'visita') AS TipoAgenda,
                    ls.ScheduledAt,
                    ls.compareceu AS Compareceu,
                    ls.virouVenda AS VirouVenda,
                    COALESCE(vendedor.name, 'Sem vendedor') AS VendedorNome,
                    COALESCE(coordenador.name, 'Sem coordenador') AS CoordenadorNome,
                    COALESCE(gerente.name, 'Sem gerente') AS GerenteNome
                FROM LeadSchedules ls
                LEFT JOIN users vendedor ON vendedor.id = ls.UserId
                LEFT JOIN users coordenador
                    ON coordenador.id = COALESCE(NULLIF(ls.CoordenadorId, 0), NULLIF(vendedor.coordenator_id, 0))
                LEFT JOIN users gerente
                    ON gerente.id = COALESCE(NULLIF(ls.GerenteId, 0), NULLIF(vendedor.manager_id, 0), NULLIF(coordenador.manager_id, 0))
                WHERE IFNULL(ls.TipoAgenda, 'visita') = @tipoAgenda
            ");

            if (startAt.HasValue)
                sql.Append(" AND ls.ScheduledAt >= @startAt");

            if (finishAt.HasValue)
                sql.Append(" AND ls.ScheduledAt <= @finishAt");

            if (vendedorId.HasValue)
                sql.Append(" AND ls.UserId = @vendedorId");

            if (coordenadorId.HasValue)
            {
                sql.Append(@"
                    AND COALESCE(NULLIF(ls.CoordenadorId, 0), NULLIF(vendedor.coordenator_id, 0)) = @coordenadorId
                ");
            }

            if (gerenteId.HasValue)
            {
                sql.Append(@"
                    AND COALESCE(NULLIF(ls.GerenteId, 0), NULLIF(vendedor.manager_id, 0), NULLIF(coordenador.manager_id, 0)) = @gerenteId
                ");
            }

            if (!canViewAll)
            {
                sql.Append(@"
                    AND (
                        ls.UserId = @currentUserId
                        OR COALESCE(NULLIF(ls.CoordenadorId, 0), NULLIF(vendedor.coordenator_id, 0)) = @currentUserId
                        OR COALESCE(NULLIF(ls.GerenteId, 0), NULLIF(vendedor.manager_id, 0), NULLIF(coordenador.manager_id, 0)) = @currentUserId
                        OR NULLIF(vendedor.gestor_id, 0) = @currentUserId
                        OR NULLIF(coordenador.gestor_id, 0) = @currentUserId
                        OR NULLIF(gerente.gestor_id, 0) = @currentUserId
                    )
                ");
            }

            return sql.ToString();
        }

        private static AtendimentoRelatorioResumoDto BuildResumo(
            List<LeadReportRow> leads,
            List<ScheduleReportRow> agendamentos,
            List<ScheduleReportRow> visitas)
        {
            return new AtendimentoRelatorioResumoDto
            {
                TotalLeads = leads.Count,
                TotalAgendamentos = agendamentos.Count,
                TotalVisitas = visitas.Count,
                VisitasRealizadas = visitas.Count(v => IsStatus(v.Status, "Realizada")),
                Comparecimentos = visitas.Count(v => v.Compareceu),
                VirouVenda = visitas.Count(v => v.VirouVenda)
            };
        }

        private static AtendimentoRelatorioConversoesDto BuildConversoes(AtendimentoRelatorioResumoDto resumo)
        {
            return new AtendimentoRelatorioConversoesDto
            {
                LeadParaAgendamento = Percentage(resumo.TotalAgendamentos, resumo.TotalLeads),
                AgendamentoParaVisita = Percentage(resumo.TotalVisitas, resumo.TotalAgendamentos),
                VisitaParaRealizada = Percentage(resumo.VisitasRealizadas, resumo.TotalVisitas),
                VisitaParaComparecimento = Percentage(resumo.Comparecimentos, resumo.TotalVisitas),
                VisitaParaVenda = Percentage(resumo.VirouVenda, resumo.TotalVisitas)
            };
        }

        private static AtendimentoRelatorioAgrupamentosDto BuildAgrupamentos(
            List<LeadReportRow> leads,
            List<ScheduleReportRow> agendamentos,
            List<ScheduleReportRow> visitas)
        {
            return new AtendimentoRelatorioAgrupamentosDto
            {
                LeadsPorStatus = GroupByLabel(leads.Select(l => l.Status), "Sem status"),
                LeadsPorEtapa = GroupByLabel(leads.Select(l => l.EtapaAtendimento), "Sem etapa"),
                AgendamentosPorStatus = GroupByLabel(agendamentos.Select(a => a.Status), "Sem status"),
                VisitasPorStatus = GroupByLabel(visitas.Select(v => v.Status), "Sem status")
            };
        }

        private static List<AtendimentoRelatorioFunilDto> BuildFunilPorVendedor(
            List<LeadReportRow> leads,
            List<ScheduleReportRow> agendamentos,
            List<ScheduleReportRow> visitas)
        {
            return BuildFunilPorEquipe(
                "Sem vendedor",
                leads.Select(l => new TeamLeadRow(l.VendedorNome, l)),
                agendamentos.Select(a => new TeamScheduleRow(a.VendedorNome, a)),
                visitas.Select(v => new TeamScheduleRow(v.VendedorNome, v)));
        }

        private static List<AtendimentoRelatorioFunilDto> BuildFunilPorEquipe(
            string fallbackName,
            IEnumerable<TeamLeadRow> leads,
            IEnumerable<TeamScheduleRow> agendamentos,
            IEnumerable<TeamScheduleRow> visitas)
        {
            var names = new HashSet<string>(
                leads.Select(x => NormalizeName(x.Name, fallbackName))
                    .Concat(agendamentos.Select(x => NormalizeName(x.Name, fallbackName)))
                    .Concat(visitas.Select(x => NormalizeName(x.Name, fallbackName)))
            );

            var result = new List<AtendimentoRelatorioFunilDto>();

            foreach (var name in names.OrderBy(x => x))
            {
                var leadCount = leads.Count(x => NormalizeName(x.Name, fallbackName) == name);
                var scheduleRows = agendamentos.Where(x => NormalizeName(x.Name, fallbackName) == name).Select(x => x.Row).ToList();
                var visitRows = visitas.Where(x => NormalizeName(x.Name, fallbackName) == name).Select(x => x.Row).ToList();

                var row = new AtendimentoRelatorioFunilDto
                {
                    Nome = name,
                    Leads = leadCount,
                    Agendamentos = scheduleRows.Count,
                    Visitas = visitRows.Count,
                    Realizadas = visitRows.Count(v => IsStatus(v.Status, "Realizada")),
                    Compareceu = visitRows.Count(v => v.Compareceu),
                    VirouVenda = visitRows.Count(v => v.VirouVenda)
                };

                row.ConversaoLeadAgendamento = Percentage(row.Agendamentos, row.Leads);
                row.ConversaoAgendamentoVisita = Percentage(row.Visitas, row.Agendamentos);
                row.ConversaoVisitaVenda = Percentage(row.VirouVenda, row.Visitas);

                result.Add(row);
            }

            return result;
        }

        private static AtendimentoRelatorioRankingsDto BuildRankings(List<AtendimentoRelatorioFunilDto> vendedorRows)
        {
            return new AtendimentoRelatorioRankingsDto
            {
                TopLeads = BuildRanking(vendedorRows, x => x.Leads),
                TopAgendamentos = BuildRanking(vendedorRows, x => x.Agendamentos),
                TopVisitas = BuildRanking(vendedorRows, x => x.Visitas),
                TopVirouVenda = BuildRanking(vendedorRows, x => x.VirouVenda),
                TopConversaoVisitaVenda = vendedorRows
                    .OrderByDescending(x => x.ConversaoVisitaVenda)
                    .ThenByDescending(x => x.VirouVenda)
                    .ThenByDescending(x => x.Visitas)
                    .Take(5)
                    .Select((x, index) => new AtendimentoRelatorioRankingDto
                    {
                        Posicao = index + 1,
                        Nome = x.Nome,
                        Valor = x.VirouVenda,
                        Percentual = x.ConversaoVisitaVenda,
                        Detalhe = $"{x.VirouVenda} de {x.Visitas}"
                    })
                    .ToList()
            };
        }

        private static List<AtendimentoRelatorioRankingDto> BuildRanking(
            List<AtendimentoRelatorioFunilDto> rows,
            Func<AtendimentoRelatorioFunilDto, int> selector)
        {
            return rows
                .OrderByDescending(selector)
                .ThenBy(x => x.Nome)
                .Take(5)
                .Select((x, index) => new AtendimentoRelatorioRankingDto
                {
                    Posicao = index + 1,
                    Nome = x.Nome,
                    Valor = selector(x),
                    Percentual = 0,
                    Detalhe = null
                })
                .ToList();
        }

        private static List<AtendimentoRelatorioGrupoDto> GroupByLabel(IEnumerable<string?> labels, string fallback)
        {
            return labels
                .Select(x => NormalizeName(x, fallback))
                .GroupBy(x => x)
                .Select(g => new AtendimentoRelatorioGrupoDto
                {
                    Label = g.Key,
                    Total = g.Count()
                })
                .OrderByDescending(x => x.Total)
                .ThenBy(x => x.Label)
                .ToList();
        }

        private static int Percentage(int part, int total)
        {
            if (total <= 0) return 0;
            return (int)Math.Round((decimal)part / total * 100, 0);
        }

        private static bool IsStatus(string? value, string expected)
        {
            return string.Equals(value?.Trim(), expected, StringComparison.OrdinalIgnoreCase);
        }

        private static string NormalizeName(string? value, string fallback)
        {
            return string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
        }

        private sealed class LeadReportRow
        {
            public int Id { get; set; }
            public string? Status { get; set; }
            public string? EtapaAtendimento { get; set; }
            public DateTime DataCriacao { get; set; }
            public string? VendedorNome { get; set; }
            public string? CoordenadorNome { get; set; }
            public string? GerenteNome { get; set; }
        }

        private sealed class ScheduleReportRow
        {
            public int Id { get; set; }
            public string? Status { get; set; }
            public string? TipoAgenda { get; set; }
            public DateTime ScheduledAt { get; set; }
            public bool Compareceu { get; set; }
            public bool VirouVenda { get; set; }
            public string? VendedorNome { get; set; }
            public string? CoordenadorNome { get; set; }
            public string? GerenteNome { get; set; }
        }

        private sealed record TeamLeadRow(string? Name, LeadReportRow Row);
        private sealed record TeamScheduleRow(string? Name, ScheduleReportRow Row);
    }
}