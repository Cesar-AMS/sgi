namespace JMImoveisAPI.Entities
{
    public class LeadDocument
    {
        public long Id { get; set; }
        public int LeadId { get; set; }
        public string OriginalFileName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public long? UploadedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }

    public class UpdateLeadDocumentRequest
    {
        public string? DisplayName { get; set; }
        public string? Description { get; set; }
    }
}
