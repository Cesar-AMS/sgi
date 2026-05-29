using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadService
    {
        Task<IEnumerable<Lead>> GetAllByFiltersAsync(LeadFilter filter, long currentUserId, bool canViewAll);
        Task<Lead?> GetByIdAsync(int id);
        Task<int> CreateLeadAsync(Lead lead, long? currentUserId = null);
        Task UpdateLeadAsync(Lead lead, long? changedByUserId = null);
        Task<bool> UpdateLeadStatusAsync(int id, string status, string? author);
        Task<bool> UpdateLeadEtapaAtendimentoAsync(int id, string etapaAtendimento, string? author);
        Task DeleteLeadAsync(Lead lead);
        Task<IEnumerable<LeadActivity>> GetActivitiesByLeadIdAsync(int leadId);
        Task<int> CreateActivityAsync(CreateLeadActivityRequest request);
        Task<IEnumerable<LeadSchedule>> GetSchedulesByLeadIdAsync(int leadId, string typeSchedule);
        Task<int> CreateScheduleAsync(CreateLeadScheduleRequest request);
        Task<(bool IsValid, string? ErrorMessage, int? Id, int? LeadId)> CreateScheduleAsync(LeadScheduleRequest request, int? leadId);
        Task<IEnumerable<VisitaDto>> ListScheduleAsync(
            string? q,
            int? vendedorId,
            string? status,
            bool? compareceu,
            bool? virouVenda,
            string? startAt,
            string? finishAt,
            string? tipoAgenda,
            long currentUserId,
            bool canViewAll);
        Task UpdateScheduleStatusAsync(int leadId, int scheduleId, UpdateLeadScheduleStatusRequest request);
        Task<(bool Success, string? ErrorMessage)> UpdateScheduleAsync(
            int id,
            VisitaPatchRequest patch,
            bool canReopenAutoCancelledSchedule = false);
        Task<BulkTransferLeadsResponse> BulkTransferLeadsAsync(
        BulkTransferLeadsRequest request,
        long changedByUserId);
    }
}
