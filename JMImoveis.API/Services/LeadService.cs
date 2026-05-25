using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using System.Globalization;

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

        public LeadService(
            ILeadRepository leadRepository,
            ILeadTransferHistoryService leadTransferHistoryService)
        {
            _leadRepository = leadRepository;
            _leadTransferHistoryService = leadTransferHistoryService;
        }

        public Task<IEnumerable<Lead>> GetAllByFiltersAsync(LeadFilter filter)
            => _leadRepository.GetAllByFilters(filter);

        public async Task<Lead?> GetByIdAsync(int id)
            => await _leadRepository.GetLeadById(id);

        public Task<int> CreateLeadAsync(Lead lead)
        {
            lead.Status = string.IsNullOrWhiteSpace(lead.Status) ? "Novo" : lead.Status;
            lead.EtapaAtendimento = string.IsNullOrWhiteSpace(lead.EtapaAtendimento)
                ? "Sem atendimento"
                : lead.EtapaAtendimento;

            return _leadRepository.CreateLeadAndReturnId(lead);
        }

        public async Task UpdateLeadAsync(Lead lead, long? changedByUserId = null)
        {
            var previousLead = await _leadRepository.GetLeadById(lead.Id);

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

        public Task<int> CreateActivityAsync(CreateLeadActivityRequest request)
            => _leadRepository.CreateActivity(request);

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

        public Task<bool> UpdateScheduleAsync(int id, VisitaPatchRequest patch)
        {
            if (patch == null)
            {
                return Task.FromResult(false);
            }

            patch.TipoAgenda = NormalizeOptionalTipoAgenda(patch.TipoAgenda);
            return _leadRepository.UpdateScheduleAsync(id, patch);
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
