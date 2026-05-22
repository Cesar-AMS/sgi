using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using MySqlConnector;
using System.Text;

namespace JMImoveisAPI.Repositories
{
    public class LeadRepository : ILeadRepository
    {
        private readonly DapperContext _context;

        public LeadRepository(DapperContext context) => _context = context;

        public async Task<int> CreateActivity(CreateLeadActivityRequest request)
        {
            var sql = @"INSERT INTO LeadActivities
                        (
                            LeadId,
                            DateTime,
                            Description,
                            Author,
                            Type
                        )
                        VALUES
                        (
                            @LeadId,
                            @DateTime,
                            @Description,
                            @Author,
                            @Type
                        );

                        SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, request);
        }

        public async Task CreateLead(Lead lead)
        {
            var sql = @"INSERT INTO leads (Nome, Email, Telefone, Status, EtapaAtendimento,
                                           Valor, Fonte, ImoveisInteresse,
                                           Vendedor, Coordenador, Gerente, Observacao)
                                        VALUES
                                        (
                                            @Nome, @Email, @Telefone, @Status, @EtapaAtendimento,
                                            @Valor, @Fonte, @ImoveisInteresse,
                                            @Vendedor, @Coordenador, @Gerente, @Observacao);";

            await using var conn = await _context.OpenConnectionAsync();
            await conn.ExecuteAsync(sql, lead);
        }

        public async Task DeleteLead(Lead lead)
        {
            var sql = @"DELETE FROM leads WHERE Id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            await conn.ExecuteAsync(sql, new { lead.Id });
        }

        public async Task<IEnumerable<LeadActivity>> GetActivitiesByLeadId(int leadId)
        {
            var sql = @"SELECT Id,
                                LeadId,
                                DateTime,
                                Description,
                                Author,
                                Type
                        FROM LeadActivities
                        WHERE LeadId = @LeadId
                        ORDER BY DateTime DESC;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<LeadActivity>(sql, new { LeadId = leadId });
        }

        public async Task<int> InsertAsync(LeadScheduleRequest request, int? leadId)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var sql = @"INSERT INTO LeadSchedules
                        (
                            LeadId,
                            ScheduledAt,
                            Note,
                            Status,
                            CreatedAt,
                            UpdatedAt,
                            UserId,
                            CoordenadorId,
                            GerenteId,
                            NameClient,
                            compareceu,
                            virouVenda,
                            TipoAgenda
                        )
                        VALUES
                        (
                            @LeadId,
                            @ScheduledAt,
                            @Note,
                            @Status,
                            @CreatedAt,
                            @UpdatedAt,
                            @UserId,
                            @CoordenadorId,
                            @GerenteId,
                            @NameClient,
                            @Compareceu,
                            @VirouVenda,
                            @TipoAgenda
                        );
                        SELECT LAST_INSERT_ID();
                    ";

            var parameters = new
            {
                LeadId = leadId,
                ScheduledAt = request.DataHoraISO.ToLocalTime(),
                Note = request.Observacao,
                Status = request.Status,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                UserId = request.VendedorId,
                CoordenadorId = (int?)null,
                GerenteId = (int?)null,
                NameClient = request.NomeCliente,
                Compareceu = request.Compareceu,
                VirouVenda = request.VirouVenda,
                TipoAgenda = request.TipoAgenda
            };

            return await conn.ExecuteScalarAsync<int>(sql, parameters);
        }
        public async Task<IEnumerable<LeadSchedule>> GetSchedulesByLeadId(int leadId, string typeSchedule)
        {
            var sql = @"SELECT Id, LeadId, ScheduledAt, Note, Status, CreatedAt, UpdatedAt
                            FROM LeadSchedules
                            WHERE LeadId = @LeadId
                            AND IFNULL(TipoAgenda,'visita') = @TypeSchedule
                            ORDER BY ScheduledAt DESC;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<LeadSchedule>(sql, new { LeadId = leadId, TypeSchedule = typeSchedule });
        }

        public async Task UpdateScheduleStatus(UpdateLeadScheduleStatusRequest req)
        {
            var sql = @"UPDATE LeadSchedules
                        SET Status = @Status,
                            UpdatedAt = NOW()
                        WHERE Id = @Id AND LeadId = @LeadId;";

            await using var conn = await _context.OpenConnectionAsync();
            await conn.ExecuteAsync(sql, req);
        }

        public async Task UpdateStatus(int leadId, int scheduleId, string status)
        {
            var sql = @"
            UPDATE LeadSchedules
            SET Status = @Status,
                UpdatedAt = NOW()
            WHERE Id = @ScheduleId
              AND LeadId = @LeadId;
        ";

            await using var conn = await _context.OpenConnectionAsync();
            await conn.ExecuteAsync(sql, new
            {
                Status = status,
                ScheduleId = scheduleId,
                LeadId = leadId
            });
        }

        public async Task<int> CreateSchedule(CreateLeadScheduleRequest req)
        {
            var sql = @"INSERT INTO LeadSchedules (LeadId, ScheduledAt, Note, Status, TipoAgenda)
                        VALUES (@LeadId, @ScheduledAt, @Note, 'Pendente', @TipoAgenda);

                        SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, req);
        }

        public async Task<IEnumerable<VisitaDto>> ListScheduleAsync(string? q, int? vendedorId, string? status, bool? compareceu, bool? virouVenda, DateTime? startAt, DateTime? finishAt, string tipoAgenda, long currentUserId, bool canViewAll)
        {

            await using var conn = await _context.OpenConnectionAsync();

            var sql = new StringBuilder(@"SELECT
                                                ls.Id,
                                                ls.LeadId,
                                                ls.UserId as VendedorId,
                                                vendedor.name as VendedorNome,
                                                COALESCE(NULLIF(ls.CoordenadorId, 0), NULLIF(vendedor.coordenator_id, 0)) as CoordenadorId,
                                                coordenador.name as CoordenadorNome,
                                                COALESCE(NULLIF(ls.GerenteId, 0), NULLIF(vendedor.manager_id, 0), NULLIF(coordenador.manager_id, 0)) as GerenteId,
                                                gerente.name as GerenteNome,
                                                ls.NameClient as NomeCliente,
                                                l.Telefone as Telefone,
                                                l.ImoveisInteresse as ImoveisInteresse,
                                                l.Fonte as Fonte,
                                                ls.ScheduledAt as DataHoraISO,
                                                ls.Note as Observacao,
                                                ls.Status,
                                                IFNULL(ls.TipoAgenda,'visita') as TipoAgenda,
                                                ls.compareceu AS Compareceu,
                                                ls.virouVenda AS VirouVenda,
                                                ls.CreatedAt,
                                                ls.UpdatedAt
                                            FROM LeadSchedules ls
                                            LEFT JOIN leads l ON l.Id = ls.LeadId
                                            LEFT JOIN users vendedor ON vendedor.id = ls.UserId
                                            LEFT JOIN users coordenador ON coordenador.id = COALESCE(NULLIF(ls.CoordenadorId, 0), NULLIF(vendedor.coordenator_id, 0))
                                            LEFT JOIN users gerente ON gerente.id = COALESCE(NULLIF(ls.GerenteId, 0), NULLIF(vendedor.manager_id, 0), NULLIF(coordenador.manager_id, 0))
                                            WHERE 1=1 AND IFNULL(ls.TipoAgenda,'visita') = @tipoAgenda
                                            ");

            var p = new DynamicParameters();
            p.Add("tipoAgenda", tipoAgenda);

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
                p.Add("currentUserId", currentUserId);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                sql.Append(@"AND (
                    ls.NameClient LIKE CONCAT('%', @q, '%')
                 OR ls.Note      LIKE CONCAT('%', @q, '%'))
                ");
                p.Add("q", q.Trim());
            }

            if (vendedorId.HasValue)
            {
                sql.Append("\nAND ls.UserId = @vendedorId");
                p.Add("vendedorId", vendedorId.Value);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                sql.Append("\nAND ls.Status = @status");
                p.Add("status", status.Trim());
            }

            if (compareceu.HasValue)
            {
                sql.Append("\nAND ls.compareceu = @compareceu");
                p.Add("compareceu", compareceu.Value);
            }

            if (virouVenda.HasValue)
            {
                sql.Append("\nAND ls.virouVenda = @virouVenda");
                p.Add("virouVenda", virouVenda.Value);
            }

            if (startAt.HasValue)
            {
                sql.Append("\nAND ls.ScheduledAt >= @startAt");
                p.Add("startAt", startAt.Value);
            }

            if (finishAt.HasValue)
            {
                sql.Append("\nAND ls.ScheduledAt <= @finishAt");
                p.Add("finishAt", finishAt.Value);
            }

            sql.Append("\nORDER BY ls.ScheduledAt DESC;");

            return await conn.QueryAsync<VisitaDto>(sql.ToString(), p);
        }

        public async Task<bool> UpdateScheduleAsync(int id, VisitaPatchRequest patch)
        {
           
            if (patch == null) return false;

            var sets = new List<string>();
            var p = new DynamicParameters();
            p.Add("Id", id);

            if (patch.NomeCliente != null)
            {
                sets.Add("NameClient = @NameClient");
                p.Add("NameClient", patch.NomeCliente);
            }

            if (patch.Observacao != null)
            {
                sets.Add("Note = @Note");
                p.Add("Note", patch.Observacao);
            }

            if (patch.Status != null)
            {
                sets.Add("Status = @Status");
                p.Add("Status", patch.Status);
            }

            if (patch.VendedorId.HasValue)
            {
                sets.Add("UserId = @UserId");
                p.Add("UserId", patch.VendedorId.Value);
            }

            if (patch.Compareceu.HasValue)
            {
                sets.Add("compareceu = @Compareceu");
                p.Add("Compareceu", patch.Compareceu.Value);
            }

            if (patch.VirouVenda.HasValue)
            {
                sets.Add("virouVenda = @VirouVenda");
                p.Add("VirouVenda", patch.VirouVenda.Value);
            }

            if (!string.IsNullOrWhiteSpace(patch.TipoAgenda))
            {
                sets.Add("TipoAgenda = @TipoAgenda");
                p.Add("TipoAgenda", patch.TipoAgenda);
            }

            if (patch.DataHoraISO.HasValue)
            {
                var dt = patch.DataHoraISO.Value;
                var scheduledAt = dt.Kind == DateTimeKind.Utc ? dt.ToLocalTime() : dt;

                sets.Add("ScheduledAt = @ScheduledAt");
                p.Add("ScheduledAt", scheduledAt);
            }

            if (sets.Count == 0)
                return false;

            sets.Add("UpdatedAt = @UpdatedAt");
            p.Add("UpdatedAt", DateTime.Now);

            var sql = $@"UPDATE LeadSchedules
                        SET {string.Join(", ", sets)}
                        WHERE Id = @Id;
                        ";

            await using var conn = await _context.OpenConnectionAsync();
            var affected = await conn.ExecuteAsync(sql, p);
            return affected > 0;
        }

        public async Task<IEnumerable<Lead>> GetAllByFilters(LeadFilter filter)
        {
            var sql = new StringBuilder(@"SELECT Id,
                                                 Nome,
                                                 Email,
                                                 Telefone,
                                                 Status,
                                                 EtapaAtendimento,
                                                 Valor,
                                                 Fonte,
                                                 ImoveisInteresse,
                                                 Vendedor,
                                                 Coordenador,
                                                 Gerente,
                                                 DataCriacao,
                                                 Observacao
                                            FROM leads
                                            WHERE 1 = 1");

            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(filter.Term))
            {
                sql.Append(" AND Nome LIKE @Nome");
                parameters.Add("@Nome", $"%{filter.Term}%");
            }

            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                sql.Append(" AND Status = @Status");
                parameters.Add("@Status", filter.Status);
            }

            if (!string.IsNullOrWhiteSpace(filter.Vendedor))
            {
                sql.Append(" AND Vendedor = @Vendedor");
                parameters.Add("@Vendedor", filter.Vendedor);
            }

            if (!string.IsNullOrWhiteSpace(filter.Coordenador))
            {
                sql.Append(" AND Coordenador = @Coordenador");
                parameters.Add("@Coordenador", filter.Coordenador);
            }

            if (!string.IsNullOrWhiteSpace(filter.Gerente))
            {
                sql.Append(" AND Gerente = @Gerente");
                parameters.Add("@Gerente", filter.Gerente);
            }

            if (filter.StartAt.HasValue)
            {
                sql.Append(" AND DataCriacao >= @StartAt");
                parameters.Add("@StartAt", filter.StartAt.Value);
            }

            if (filter.FinishAt.HasValue)
            {
                sql.Append(" AND DataCriacao <= @FinishAt");
                parameters.Add("@FinishAt", filter.FinishAt.Value);
            }

            // opcional: ordenar
            sql.Append(" ORDER BY DataCriacao DESC");

            await using var conn = await _context.OpenConnectionAsync();
            var result = await conn.QueryAsync<Lead>(sql.ToString(), parameters);
            return result;
        }

        public async Task<Lead> GetLeadById(int id)
        {
            var sql = @"SELECT  Id,
                                Nome,
                                Email,
                                Telefone,
                                Status,
                                EtapaAtendimento,
                                Valor,
                                Fonte,
                                ImoveisInteresse,
                                Vendedor,
                                Coordenador,
                                Gerente,
                                DataCriacao,
                                Observacao
                            FROM leads
                            WHERE Id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            var lead = await conn.QueryFirstOrDefaultAsync<Lead>(sql, new { Id = id });
            return lead;
        }

        public async Task UpdateLead(Lead lead)
        {
            var sql = @"UPDATE leads SET
                                        Nome = @Nome,
                                        Email = @Email,
                                        Telefone = @Telefone,
                                        Status = @Status,
                                        Valor = @Valor,
                                        Fonte = @Fonte,
                                        ImoveisInteresse = @ImoveisInteresse,
                                        Vendedor = @Vendedor,
                                        Coordenador = @Coordenador,
                                        Gerente = @Gerente,
                                        Observacao = @Observacao
                                    WHERE Id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            await conn.ExecuteAsync(sql, lead);
        }

        public async Task<int> CreateLeadAndReturnId(Lead lead)
        {
            var sql = @"INSERT INTO leads (Nome, Email, Telefone, Status, EtapaAtendimento,
                                           Valor, Fonte, ImoveisInteresse,
                                           Vendedor, Coordenador, Gerente, Observacao)
                                        VALUES
                                        (
                                            @Nome, @Email, @Telefone, @Status, @EtapaAtendimento,
                                            @Valor, @Fonte, @ImoveisInteresse,
                                            @Vendedor, @Coordenador, @Gerente, @Observacao
                                        );

                        SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, lead);
        }

        public async Task<bool> UpdateLeadStatus(int id, string status, CreateLeadActivityRequest activity)
        {
            const string updateSql = @"UPDATE leads
                                       SET Status = @Status
                                       WHERE Id = @Id;";

            const string activitySql = @"INSERT INTO LeadActivities
                                        (
                                            LeadId,
                                            DateTime,
                                            Description,
                                            Author,
                                            Type
                                        )
                                        VALUES
                                        (
                                            @LeadId,
                                            @DateTime,
                                            @Description,
                                            @Author,
                                            @Type
                                        );";

            await using var conn = await _context.OpenConnectionAsync();
            await using var transaction = await conn.BeginTransactionAsync();

            var affectedRows = await conn.ExecuteAsync(updateSql, new { Id = id, Status = status }, transaction);
            if (affectedRows == 0)
            {
                await transaction.RollbackAsync();
                return false;
            }

            await conn.ExecuteAsync(activitySql, activity, transaction);
            await transaction.CommitAsync();

            return true;
        }

        public async Task<bool> UpdateLeadEtapaAtendimento(int id, string etapaAtendimento, CreateLeadActivityRequest activity)
        {
            const string updateSql = @"UPDATE leads
                                       SET EtapaAtendimento = @EtapaAtendimento
                                       WHERE Id = @Id;";

            const string activitySql = @"INSERT INTO LeadActivities
                                        (
                                            LeadId,
                                            DateTime,
                                            Description,
                                            Author,
                                            Type
                                        )
                                        VALUES
                                        (
                                            @LeadId,
                                            @DateTime,
                                            @Description,
                                            @Author,
                                            @Type
                                        );";

            await using var conn = await _context.OpenConnectionAsync();
            await using var transaction = await conn.BeginTransactionAsync();

            var affectedRows = await conn.ExecuteAsync(updateSql, new { Id = id, EtapaAtendimento = etapaAtendimento }, transaction);
            if (affectedRows == 0)
            {
                await transaction.RollbackAsync();
                return false;
            }

            await conn.ExecuteAsync(activitySql, activity, transaction);
            await transaction.CommitAsync();

            return true;
        }
    }
}
