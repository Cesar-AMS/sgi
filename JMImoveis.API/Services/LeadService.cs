using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using System.Globalization;
using System.Text;

namespace JMImoveisAPI.Services
{
    public class LeadService : ILeadService
    {
        private static readonly HashSet<string> ValidLeadStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "Novo",
            "Em Contato",
            "Em Negociação",
            "Ganhou",
            "Perdeu"
        };

        private static readonly HashSet<string> ValidLeadEtapasAtendimento = new(StringComparer.OrdinalIgnoreCase)
        {
            "Sem atendimento",
            "Em atendimento",
            "Agendamento de retorno",
            "Visita agendada",
            "Visita concluída"
        };

        private readonly ILeadRepository _leadRepository;
        private readonly ILeadTransferHistoryService _leadTransferHistoryService;
        private readonly ILeadPostVisitService _leadPostVisitService;
        private readonly ILogger<LeadService> _logger;

        public LeadService(
            ILeadRepository leadRepository,
            ILeadTransferHistoryService leadTransferHistoryService,
            ILeadPostVisitService leadPostVisitService,
            ILogger<LeadService> logger)
        {
            _leadRepository = leadRepository;
            _leadTransferHistoryService = leadTransferHistoryService;
            _leadPostVisitService = leadPostVisitService;
            _logger = logger;
        }

        public Task<IEnumerable<Lead>> GetAllByFiltersAsync(LeadFilter filter, long currentUserId, bool canViewAll)
            => _leadRepository.GetAllByFilters(filter, currentUserId, canViewAll);

        public async Task<Lead?> GetByIdAsync(int id)
            => await _leadRepository.GetLeadById(id);

        public Task<int> CreateLeadAsync(Lead lead, long? currentUserId = null)
        {
            lead.Status = string.IsNullOrWhiteSpace(lead.Status) ? "Novo" : lead.Status;
            lead.EtapaAtendimento = string.IsNullOrWhiteSpace(lead.EtapaAtendimento)
                ? "Sem atendimento"
                : lead.EtapaAtendimento;

            if (currentUserId.HasValue && currentUserId.Value > 0)
            {
                lead.OwnerUserId = currentUserId.Value;
                lead.AssignedByUserId = currentUserId.Value;
                lead.AssignedAt = DateTime.Now;
            }
            else
            {
                _logger.LogWarning("Lead criado sem owner_user_id porque o usuario logado nao foi identificado.");
            }

            return _leadRepository.CreateLeadAndReturnId(lead);
        }

        public async Task<BulkTransferLeadsResponse> BulkTransferLeadsAsync(
            BulkTransferLeadsRequest request,
            long changedByUserId)
        {
            if (request == null)
            {
                throw new ArgumentException("Solicitação inválida.");
            }

            request.LeadIds = request.LeadIds
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            if (!request.LeadIds.Any())
            {
                throw new ArgumentException("Selecione ao menos um lead para transferir.");
            }

            if (request.ToUserId <= 0)
            {
                throw new ArgumentException("Agente destino inválido.");
            }

            if (changedByUserId <= 0)
            {
                throw new ArgumentException("Usuário responsável pela transferência não identificado.");
            }

            request.Reason = string.IsNullOrWhiteSpace(request.Reason)
                ? "Transferência manual de leads selecionados."
                : request.Reason.Trim();

            return await _leadRepository.BulkTransferLeadsAsync(request, changedByUserId);
        }

        public async Task UpdateLeadAsync(Lead lead, long? changedByUserId = null)
        {
            var previousLead = await _leadRepository.GetLeadById(lead.Id);

            if (previousLead != null && string.IsNullOrWhiteSpace(lead.EtapaAtendimento))
            {
                lead.EtapaAtendimento = previousLead.EtapaAtendimento;
            }

            if (ShouldMoveToEmAtendimento(previousLead))
            {
                lead.EtapaAtendimento = "Em atendimento";
            }

            await _leadRepository.UpdateLead(lead);

            if (previousLead != null)
            {
                await _leadTransferHistoryService.RegisterIfResponsibleChangedAsync(
                    previousLead,
                    lead,
                    changedByUserId);
            }
        }

        public async Task<bool> UpdateLeadStatusAsync(int id, string status, string? author)
        {
            if (id <= 0)
                throw new ArgumentException("Lead invalido.");

            var normalizedStatus = NormalizeLeadStatus(status);
            if (string.IsNullOrWhiteSpace(normalizedStatus))
                throw new ArgumentException("Status do lead e obrigatorio.");

            if (!ValidLeadStatuses.Contains(normalizedStatus))
                throw new ArgumentException("Status do lead invalido.");

            var lead = await _leadRepository.GetLeadById(id);
            if (lead == null)
                return false;

            var previousStatus = string.IsNullOrWhiteSpace(lead.Status) ? "Sem status" : lead.Status.Trim();
            var activity = new CreateLeadActivityRequest
            {
                LeadId = id,
                DateTime = DateTime.Now,
                Description = $"Status alterado de \"{previousStatus}\" para \"{normalizedStatus}\".",
                Author = string.IsNullOrWhiteSpace(author) ? "Sistema" : author.Trim(),
                Type = "Status"
            };

            return await _leadRepository.UpdateLeadStatus(id, normalizedStatus, activity);
        }

        public async Task<bool> UpdateLeadEtapaAtendimentoAsync(int id, string etapaAtendimento, string? author)
        {
            if (id <= 0)
                throw new ArgumentException("Lead invalido.");

            var normalizedEtapaAtendimento = NormalizeLeadEtapaAtendimento(etapaAtendimento);
            if (string.IsNullOrWhiteSpace(normalizedEtapaAtendimento))
                throw new ArgumentException("Etapa de atendimento do lead e obrigatoria.");

            if (!ValidLeadEtapasAtendimento.Contains(normalizedEtapaAtendimento))
                throw new ArgumentException("Etapa de atendimento do lead invalida.");

            var lead = await _leadRepository.GetLeadById(id);
            if (lead == null)
                return false;

            var previousEtapa = string.IsNullOrWhiteSpace(lead.EtapaAtendimento)
                ? "Sem etapa"
                : lead.EtapaAtendimento.Trim();

            var activity = new CreateLeadActivityRequest
            {
                LeadId = id,
                DateTime = DateTime.Now,
                Description = $"Etapa de atendimento alterada de \"{previousEtapa}\" para \"{normalizedEtapaAtendimento}\".",
                Author = string.IsNullOrWhiteSpace(author) ? "Sistema" : author.Trim(),
                Type = "EtapaAtendimento"
            };

            return await _leadRepository.UpdateLeadEtapaAtendimento(id, normalizedEtapaAtendimento, activity);
        }

        public Task DeleteLeadAsync(Lead lead)
            => _leadRepository.DeleteLead(lead);

        public Task<IEnumerable<LeadActivity>> GetActivitiesByLeadIdAsync(int leadId)
            => _leadRepository.GetActivitiesByLeadId(leadId);

        public async Task<int> CreateActivityAsync(CreateLeadActivityRequest request)
        {
            var activityId = await _leadRepository.CreateActivity(request);

            try
            {
                var lead = await _leadRepository.GetLeadById(request.LeadId);
                if (IsRealInteractionActivity(request) && ShouldMoveToEmAtendimento(lead))
                {
                    await _leadRepository.UpdateLeadEtapaAtendimento(request.LeadId, "Em atendimento");
                }

                if (IsRealInteractionActivity(request) && IsNewLeadStatus(lead?.Status))
                {
                    var activity = new CreateLeadActivityRequest
                    {
                        LeadId = request.LeadId,
                        DateTime = DateTime.Now,
                        Description = "Status alterado automaticamente de \"Novo\" para \"Em Contato\" apos registro de interacao.",
                        Author = "Sistema",
                        Type = "Status"
                    };

                    await _leadRepository.UpdateLeadStatus(request.LeadId, "Em Contato", activity);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Interacao {ActivityId} criada, mas nao foi possivel atualizar automaticamente o status do lead {LeadId}.", activityId, request.LeadId);
            }

            return activityId;
        }

        public Task<IEnumerable<LeadSchedule>> GetSchedulesByLeadIdAsync(int leadId, string typeSchedule)
            => _leadRepository.GetSchedulesByLeadId(leadId, typeSchedule);

        public Task<int> CreateScheduleAsync(CreateLeadScheduleRequest request)
        {
            request.TipoAgenda = NormalizeTipoAgenda(request.TipoAgenda);
            return _leadRepository.CreateSchedule(request);
        }

        public async Task<(bool IsValid, string? ErrorMessage, int? Id, int? LeadId)> CreateScheduleAsync(LeadScheduleRequest request, int? leadId)
        {
            if (request == null)
                return (false, "Body inválido.", null, null);

            if (string.IsNullOrWhiteSpace(request.NomeCliente))
                return (false, "nomeCliente é obrigatório.", null, null);

            if (string.IsNullOrWhiteSpace(request.Status))
                return (false, "status é obrigatório.", null, null);

            if (request.VendedorId <= 0)
                return (false, "vendedorId inválido.", null, null);

            request.TipoAgenda = NormalizeTipoAgenda(request.TipoAgenda);

            var effectiveLeadId = await EnsureScheduleLeadIdAsync(request, leadId);
            var scheduleId = await _leadRepository.InsertAsync(request, effectiveLeadId);
            return (true, null, scheduleId, effectiveLeadId);
        }

        public Task<IEnumerable<VisitaDto>> ListScheduleAsync(
            string? q,
            int? vendedorId,
            string? status,
            bool? compareceu,
            bool? virouVenda,
            string? startAt,
            string? finishAt,
            string? tipoAgenda,
            long currentUserId,
            bool canViewAll)
        {
            DateTime? start = TryParseIsoDate(startAt);
            DateTime? finish = TryParseIsoDate(finishAt);
            var normalizedTipoAgenda = NormalizeOptionalTipoAgenda(tipoAgenda);

            return _leadRepository.ListScheduleAsync(
                q, vendedorId, status, compareceu, virouVenda, start, finish, normalizedTipoAgenda, currentUserId, canViewAll
            );
        }

        public Task UpdateScheduleStatusAsync(int leadId, int scheduleId, UpdateLeadScheduleStatusRequest request)
            => _leadRepository.UpdateStatus(leadId, scheduleId, request.Status);

        public async Task<bool> UpdateScheduleAsync(int id, VisitaPatchRequest patch)
        {
            if (patch == null)
            {
                return false;
            }

            patch.TipoAgenda = NormalizeOptionalTipoAgenda(patch.TipoAgenda);
            var updated = await _leadRepository.UpdateScheduleAsync(id, patch);
            if (!updated)
            {
                return false;
            }

            await TryEnsurePostVisitForCompletedVisitAsync(id);
            return true;
        }

        private static DateTime? TryParseIsoDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;

            if (DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var dto))
                return dto.LocalDateTime;

            if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
                return dt;

            return null;
        }

        private static string NormalizeTipoAgenda(string? tipoAgenda)
        {
            if (string.IsNullOrWhiteSpace(tipoAgenda))
                return "contato";

            var normalized = tipoAgenda.Trim().ToLowerInvariant();
            return normalized is "contato" or "visita"
                ? normalized
                : "contato";
        }

        private static string? NormalizeOptionalTipoAgenda(string? tipoAgenda)
        {
            if (string.IsNullOrWhiteSpace(tipoAgenda))
                return null;

            var normalized = tipoAgenda.Trim().ToLowerInvariant();
            return normalized is "contato" or "visita"
                ? normalized
                : null;
        }

        private async Task TryEnsurePostVisitForCompletedVisitAsync(int scheduleId)
        {
            try
            {
                var schedule = await _leadRepository.GetScheduleByIdAsync(scheduleId);
                if (!ShouldCreatePostVisit(schedule))
                {
                    return;
                }

                await TryMoveLeadToVisitCompletedAsync(schedule);

                await _leadPostVisitService.EnsurePostVisitForCompletedVisitAsync(
                    schedule!.LeadId!.Value,
                    schedule.VendedorId > 0 ? (long)schedule.VendedorId : null,
                    "Pos-visita iniciado automaticamente apos visita realizada.");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Visita {ScheduleId} atualizada, mas nao foi possivel iniciar o pos-visita automaticamente.", scheduleId);
            }
        }

        private async Task TryMoveLeadToVisitCompletedAsync(VisitaDto? schedule)
        {
            if (!ShouldMoveLeadToVisitCompleted(schedule))
            {
                return;
            }

            var leadId = schedule!.LeadId!.Value;
            var lead = await _leadRepository.GetLeadById(leadId);
            if (lead == null || IsLeadEtapaAtendimento(lead.EtapaAtendimento, "Visita concluida"))
            {
                return;
            }

            var targetEtapa = GetCanonicalLeadEtapaAtendimento("Visita concluida");
            var previousEtapa = string.IsNullOrWhiteSpace(lead.EtapaAtendimento)
                ? "Sem etapa"
                : lead.EtapaAtendimento.Trim();

            var activity = new CreateLeadActivityRequest
            {
                LeadId = leadId,
                DateTime = DateTime.Now,
                Description = $"Etapa de atendimento alterada automaticamente de \"{previousEtapa}\" para \"{targetEtapa}\" apos visita realizada.",
                Author = "Sistema",
                Type = "EtapaAtendimento"
            };

            await _leadRepository.UpdateLeadEtapaAtendimento(leadId, targetEtapa, activity);
        }

        private static bool ShouldMoveLeadToVisitCompleted(VisitaDto? schedule)
        {
            if (schedule?.LeadId is not > 0)
            {
                return false;
            }

            var tipoAgenda = NormalizeOptionalTipoAgenda(schedule.TipoAgenda);
            if (!string.Equals(tipoAgenda, "visita", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            if (IsCanceledVisitStatus(schedule.Status))
            {
                return false;
            }

            return IsCompletedVisitStatus(schedule.Status);
        }

        private static bool ShouldCreatePostVisit(VisitaDto? schedule)
        {
            if (schedule?.LeadId is not > 0)
            {
                return false;
            }

            var tipoAgenda = NormalizeOptionalTipoAgenda(schedule.TipoAgenda);
            if (!string.Equals(tipoAgenda, "visita", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            if (IsCanceledVisitStatus(schedule.Status))
            {
                return false;
            }

            return IsCompletedVisitStatus(schedule.Status) || schedule.Compareceu;
        }

        private static bool IsCompletedVisitStatus(string? status)
        {
            var normalized = RemoveDiacritics(status).Trim().ToLowerInvariant();
            return normalized is "realizada" or "visita realizada";
        }

        private static bool IsCanceledVisitStatus(string? status)
        {
            var normalized = RemoveDiacritics(status).Trim().ToLowerInvariant();
            return normalized is "cancelada" or "cancelado";
        }

        private static string RemoveDiacritics(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            var normalized = value.Normalize(NormalizationForm.FormD);
            var chars = normalized.Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark);
            return new string(chars.ToArray()).Normalize(NormalizationForm.FormC);
        }

        private static bool IsNewLeadStatus(string? status)
            => string.Equals(RemoveDiacritics(status).Trim(), "Novo", StringComparison.OrdinalIgnoreCase);

        private static bool IsLeadEtapaAtendimento(string? currentEtapa, string expectedEtapa)
            => string.Equals(
                RemoveDiacritics(currentEtapa).Trim(),
                RemoveDiacritics(expectedEtapa).Trim(),
                StringComparison.OrdinalIgnoreCase);

        private static string GetCanonicalLeadEtapaAtendimento(string etapaAtendimento)
            => ValidLeadEtapasAtendimento.FirstOrDefault(etapa =>
                string.Equals(
                    RemoveDiacritics(etapa).Trim(),
                    RemoveDiacritics(etapaAtendimento).Trim(),
                    StringComparison.OrdinalIgnoreCase))
               ?? etapaAtendimento;

        private static bool ShouldMoveToEmAtendimento(Lead? lead)
        {
            if (lead == null)
            {
                return false;
            }

            var etapaAtendimento = RemoveDiacritics(lead.EtapaAtendimento).Trim();
            if (string.Equals(etapaAtendimento, "Sem atendimento", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return string.IsNullOrWhiteSpace(lead.EtapaAtendimento) && IsNewLeadStatus(lead.Status);
        }

        private static bool IsRealInteractionActivity(CreateLeadActivityRequest request)
        {
            var type = RemoveDiacritics(request.Type).Trim();
            return !string.Equals(type, "Status", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(type, "EtapaAtendimento", StringComparison.OrdinalIgnoreCase);
        }

        private async Task<int> EnsureScheduleLeadIdAsync(LeadScheduleRequest request, int? leadId)
        {
            if (leadId.HasValue && leadId.Value > 0)
            {
                return leadId.Value;
            }

            if (request.LeadId.HasValue && request.LeadId.Value > 0)
            {
                return request.LeadId.Value;
            }

            var lead = new Lead
            {
                Nome = request.NomeCliente?.Trim() ?? string.Empty,
                Telefone = string.IsNullOrWhiteSpace(request.Telefone) ? null : request.Telefone.Trim(),
                Status = "Novo",
                EtapaAtendimento = request.TipoAgenda == "visita" ? "Visita agendada" : "Agendamento de retorno",
                Vendedor = request.VendedorId > 0 ? request.VendedorId.ToString() : null,
                Observacao = request.Observacao
            };

            return await _leadRepository.CreateLeadAndReturnId(lead);
        }

        private static string NormalizeLeadStatus(string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return string.Empty;

            var trimmed = status.Trim();
            return ValidLeadStatuses.FirstOrDefault(s => string.Equals(s, trimmed, StringComparison.OrdinalIgnoreCase))
                ?? trimmed;
        }

        private static string NormalizeLeadEtapaAtendimento(string? etapaAtendimento)
        {
            if (string.IsNullOrWhiteSpace(etapaAtendimento))
                return string.Empty;

            var trimmed = etapaAtendimento.Trim();
            return ValidLeadEtapasAtendimento.FirstOrDefault(s => string.Equals(s, trimmed, StringComparison.OrdinalIgnoreCase))
                ?? trimmed;
        }
    }
}
