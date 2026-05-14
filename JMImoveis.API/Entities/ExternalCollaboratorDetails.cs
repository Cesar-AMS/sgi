namespace JMImoveisAPI.Entities
{
    public class ExternalCollaboratorDetails
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? ContractFileName { get; set; }
        public string? ContractFilePath { get; set; }
        public string? ContractContentType { get; set; }
        public long? ContractSize { get; set; }
        public string? Notes { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
