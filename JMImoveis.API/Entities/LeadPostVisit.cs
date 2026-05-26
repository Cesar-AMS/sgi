namespace JMImoveisAPI.Entities
{
    public class LeadPostVisit
    {
        public long Id { get; set; }
        public int LeadId { get; set; }
        public string? Cpf { get; set; }
        public bool? HasRestriction { get; set; }
        public string? IncomeType { get; set; }
        public string? InterestRegion { get; set; }
        public bool? PaysRent { get; set; }
        public string? MaritalStatus { get; set; }
        public decimal? DownPaymentAmount { get; set; }
        public long? AttendingAgentId { get; set; }
        public string? PropertyInterestType { get; set; }
        public string PostVisitStatus { get; set; } = "ACOMPANHANDO";
        public DateTime? NextFollowUpAt { get; set; }
        public string? LastInteractionSummary { get; set; }
        public long? ProposalId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }

    public class LeadPostVisitRequest
    {
        public string? Cpf { get; set; }
        public bool? HasRestriction { get; set; }
        public string? IncomeType { get; set; }
        public string? InterestRegion { get; set; }
        public bool? PaysRent { get; set; }
        public string? MaritalStatus { get; set; }
        public decimal? DownPaymentAmount { get; set; }
        public long? AttendingAgentId { get; set; }
        public string? PropertyInterestType { get; set; }
        public string? PostVisitStatus { get; set; }
        public DateTime? NextFollowUpAt { get; set; }
        public string? LastInteractionSummary { get; set; }
        public long? ProposalId { get; set; }
    }

    public class UpdateLeadPostVisitStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    public class LeadPostVisitListItem
    {
        public long PostVisitId { get; set; }
        public int LeadId { get; set; }
        public string NomeCliente { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public string? Email { get; set; }
        public string? Cpf { get; set; }
        public string PostVisitStatus { get; set; } = string.Empty;
        public DateTime? NextFollowUpAt { get; set; }
        public long? AttendingAgentId { get; set; }
        public string? AttendingAgentName { get; set; }
        public string? InterestRegion { get; set; }
        public decimal? DownPaymentAmount { get; set; }
        public string? PropertyInterestType { get; set; }
        public string? LastInteractionSummary { get; set; }
        public long? ProposalId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
