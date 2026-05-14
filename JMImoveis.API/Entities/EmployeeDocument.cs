namespace JMImoveisAPI.Entities
{
    public class EmployeeDocument
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string? DocumentType { get; set; }
        public string? DocumentLabel { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public string? ContentType { get; set; }
        public long FileSize { get; set; }
        public string? Notes { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
