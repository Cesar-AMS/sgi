using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using System.Globalization;

namespace JMImoveisAPI.Services
{
    public class LeadService : ILeadService
    {
        private readonly ILeadRepository _leadRepository;

        public LeadService(ILeadRepository leadRepository)
        {
            _leadRepository = leadRepository;
        }

        public Task<IEnumerable<Lead>> GetAllByFiltersAsync(LeadFilter filter)
            => _leadRepository.GetAllByFilters(filter);

        public Task<Lead?> GetByIdAsync(int id)
            => _leadRepository.GetLeadById(id);

        public Task CreateLeadAsync(Lead lead)
            => _leadRepository.CreateLead(lead);

        public Task UpdateLeadAsync(Lead lead)
            => _leadRepository.UpdateLead(lead);

        public Task DeleteLeadAsync(Lead lead)
            => _leadRepository.DeleteLead(lead);

        public Task<IEnumerable<LeadActivity>> GetActivitiesByLeadIdAsync(int leadId)
            => _leadRepository.GetActivitiesByLeadId(leadId);

        public Task<int> CreateActivityAsync(CreateLeadActivityRequest request)
            => _leadRepository.CreateActivity(request);

        public Task<IEnumerable<LeadSchedule>> GetSchedulesByLeadIdAsync(int leadId, string typeSchedule)
            => _leadRepository.GetSchedulesByLeadId(leadId, typeSchedule);

        public Task<int> CreateScheduleAsync(CreateLeadScheduleRequest request)
            => _leadRepository.CreateSchedule(request);

        public async Task<(bool IsValid, string? ErrorMessage)> CreateScheduleAsync(LeadScheduleRequest request, int? leadId)
        {
            if (request == null)
                return (false, "Body inválido.");

            if (string.IsNullOrWhiteSpace(request.NomeCliente))
                return (false, "nomeCliente é obrigatório.");

            if (string.IsNullOrWhiteSpace(request.Status))
                return (false, "status é obrigatório.");

            if (request.VendedorId <= 0)
                return (false, "vendedorId inválido.");

            await _leadRepository.InsertAsync(request, leadId);
            return (true, null);
        }

        public Task<IEnumerable<VisitaDto>> ListScheduleAsync(
            string? q,
            int? vendedorId,
            string? status,
            bool? compareceu,
            bool? virouVenda,
            string? startAt,
            string? finishAt)
        {
            DateTime? start = TryParseIsoDate(startAt);
            DateTime? finish = TryParseIsoDate(finishAt);

            return _leadRepository.ListScheduleAsync(
                q, vendedorId, status, compareceu, virouVenda, start, finish
            );
        }

        public Task UpdateScheduleStatusAsync(int leadId, int scheduleId, UpdateLeadScheduleStatusRequest request)
            => _leadRepository.UpdateStatus(leadId, scheduleId, request.Status);

        public Task<bool> UpdateScheduleAsync(int id, VisitaPatchRequest patch)
            => _leadRepository.UpdateScheduleAsync(id, patch);

        private static DateTime? TryParseIsoDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;

            if (DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var dto))
                return dto.LocalDateTime;

            if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
                return dt;

            return null;
        }
    }
}
