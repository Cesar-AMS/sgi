namespace JMImoveisAPI.Entities
{
    public class LeadInterestRegion
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int SortOrder { get; set; } = 100;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateLeadInterestRegionRequest
    {
        public string? Name { get; set; }
        public bool IsActive { get; set; } = true;
        public int? SortOrder { get; set; }
    }

    public class UpdateLeadInterestRegionRequest
    {
        public string? Name { get; set; }
        public bool IsActive { get; set; } = true;
        public int? SortOrder { get; set; }
    }

    public class ToggleLeadInterestRegionRequest
    {
        public bool IsActive { get; set; }
    }
}
