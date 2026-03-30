using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadService
    {
        Task<IEnumerable<Lead>> GetAllByFiltersAsync(LeadFilter filter);
        Task<Lead?> GetByIdAsync(int id);
        Task CreateLeadAsync(Lead lead);
        Task UpdateLeadAsync(Lead lead);
        Task DeleteLeadAsync(Lead lead);
        Task<IEnumerable<LeadActivity>> GetActivitiesByLeadIdAsync(int leadId);
        Task<int> CreateActivityAsync(CreateLeadActivityRequest request);
        Task<IEnumerable<LeadSchedule>> GetSchedulesByLeadIdAsync(int leadId, string typeSchedule);
        Task<int> CreateScheduleAsync(CreateLeadScheduleRequest request);
        Task<(bool IsValid, string? ErrorMessage)> CreateScheduleAsync(LeadScheduleRequest request, int? leadId);
        Task<IEnumerable<VisitaDto>> ListScheduleAsync(
            string? q,
            int? vendedorId,
            string? status,
            bool? compareceu,
            bool? virouVenda,
            string? startAt,
            string? finishAt);
        Task UpdateScheduleStatusAsync(int leadId, int scheduleId, UpdateLeadScheduleStatusRequest request);
        Task<bool> UpdateScheduleAsync(int id, VisitaPatchRequest patch);
    }
}
