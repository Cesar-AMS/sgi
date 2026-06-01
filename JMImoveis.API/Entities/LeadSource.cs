namespace JMImoveisAPI.Entities
{
    public class LeadSource
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int SortOrder { get; set; } = 100;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateLeadSourceRequest
    {
        public string? Name { get; set; }
        public bool IsActive { get; set; } = true;
        public int? SortOrder { get; set; }
    }

    public class UpdateLeadSourceRequest
    {
        public string? Name { get; set; }
        public bool IsActive { get; set; } = true;
        public int? SortOrder { get; set; }
    }

    public class ToggleLeadSourceRequest
    {
        public bool IsActive { get; set; }
    }
}
