namespace JMImoveisAPI.Entities
{
    public class LeadDistributionAgent
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string? UserName { get; set; }
        public bool IsActive { get; set; }
        public string Level { get; set; } = "INTERMEDIARIO";
        public int Priority { get; set; } = 100;
        public int? MaxDailyLeads { get; set; }
        public DateTime? LastAssignedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateLeadDistributionAgentRequest
    {
        public long UserId { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Level { get; set; }
        public int? Priority { get; set; }
        public int? MaxDailyLeads { get; set; }
    }

    public class UpdateLeadDistributionAgentRequest
    {
        public bool IsActive { get; set; } = true;
        public string? Level { get; set; }
        public int? Priority { get; set; }
        public int? MaxDailyLeads { get; set; }
    }

    public class ToggleLeadDistributionAgentRequest
    {
        public bool IsActive { get; set; }
    }
}
