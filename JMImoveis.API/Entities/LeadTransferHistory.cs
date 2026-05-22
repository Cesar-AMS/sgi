namespace JMImoveisAPI.Entities
{
    public class LeadTransferHistory
    {
        public long Id { get; set; }
        public int LeadId { get; set; }
        public long? PreviousSellerId { get; set; }
        public string? PreviousSellerLabel { get; set; }
        public long? NewSellerId { get; set; }
        public string? NewSellerLabel { get; set; }
        public long? PreviousCoordinatorId { get; set; }
        public string? PreviousCoordinatorLabel { get; set; }
        public long? NewCoordinatorId { get; set; }
        public string? NewCoordinatorLabel { get; set; }
        public long? PreviousManagerId { get; set; }
        public string? PreviousManagerLabel { get; set; }
        public long? NewManagerId { get; set; }
        public string? NewManagerLabel { get; set; }
        public long? ChangedByUserId { get; set; }
        public string? ChangeReason { get; set; }
        public DateTime CreatedAt { get; set; }

        public string? PreviousSellerName { get; set; }
        public string? NewSellerName { get; set; }
        public string? PreviousCoordinatorName { get; set; }
        public string? NewCoordinatorName { get; set; }
        public string? PreviousManagerName { get; set; }
        public string? NewManagerName { get; set; }
        public string? ChangedByUserName { get; set; }
    }
}
