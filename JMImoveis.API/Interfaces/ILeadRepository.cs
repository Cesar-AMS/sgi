using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Interfaces
{
    public interface ILeadRepository
    {
        Task CreateLead(Lead lead);
        Task<int> CreateLeadAndReturnId(Lead lead);
        Task<IEnumerable<Lead>> GetAllByFilters(LeadFilter filter);
        Task<Lead> GetLeadById(int id);
        Task UpdateLead(Lead lead);
        Task<bool> UpdateLeadStatus(int id, string status, CreateLeadActivityRequest activity);
        Task<bool> UpdateLeadEtapaAtendimento(int id, string etapaAtendimento, CreateLeadActivityRequest activity);
        Task<bool> UpdateLeadEtapaAtendimento(int id, string etapaAtendimento);
        Task DeleteLead(Lead lead);
        Task<int> CreateActivity(CreateLeadActivityRequest request);
        Task<IEnumerable<LeadActivity>> GetActivitiesByLeadId(int leadId);
        Task<IEnumerable<LeadSchedule>> GetSchedulesByLeadId(int leadId, string typeSchedule);
        Task<bool> UpdateScheduleAsync(int id, VisitaPatchRequest patch);
        Task<VisitaDto?> GetScheduleByIdAsync(int id);
        Task<int> InsertAsync(LeadScheduleRequest request, int? leadId);
        Task<IEnumerable<VisitaDto>> ListScheduleAsync(string? q, int? vendedorId, string? status, bool? compareceu, bool? virouVenda, DateTime? startAt, DateTime? finishAt, string? tipoAgenda, long currentUserId, bool canViewAll);
        Task<int> CreateSchedule(CreateLeadScheduleRequest req);

        Task UpdateStatus(int leadId, int scheduleId, string status);
    }
}
