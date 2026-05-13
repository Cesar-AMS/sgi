namespace JMImoveisAPI.Entities
{
    public class EnterpriseCommissionRule
    {
        public long Id { get; set; }
        public long EnterpriseId { get; set; }
        public string RuleType { get; set; } = string.Empty;
        public int Version { get; set; }
        public bool Active { get; set; } = true;
        public DateTime? StartsAt { get; set; }
        public DateTime? EndsAt { get; set; }
        public decimal? AtoThreshold { get; set; } = 5000m;
        public int PaymentDay { get; set; } = 5;
        public bool DirectorEnabled { get; set; }
        public string? CampaignName { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<EnterpriseCommissionRuleItem> Items { get; set; } = new();
    }

    public class EnterpriseCommissionRuleItem
    {
        public long Id { get; set; }
        public long RuleId { get; set; }
        public string Role { get; set; } = string.Empty;
        public decimal? Percentage { get; set; }
        public decimal? FixedAmount { get; set; }
        public string PaymentMode { get; set; } = "FIXED_DAY";
        public int? PaymentDay { get; set; }
        public bool Active { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
