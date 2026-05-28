namespace JMImoveisAPI.Entities
{
    public class BulkTransferLeadsRequest
    {
        public List<int> LeadIds { get; set; } = new();
        public long ToUserId { get; set; }
        public string? Reason { get; set; }
    }

    public class BulkTransferLeadsResponse
    {
        public int RequestedCount { get; set; }
        public int TransferredCount { get; set; }
        public int SkippedCount { get; set; }
        public long ToUserId { get; set; }
        public List<int> TransferredLeadIds { get; set; } = new();
        public List<int> SkippedLeadIds { get; set; } = new();
    }
}
