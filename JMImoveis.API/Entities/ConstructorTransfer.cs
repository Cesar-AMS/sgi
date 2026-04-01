namespace JMImoveisAPI.Entities
{
    public class ConstructorTransfer
    {
        public int? Id { get; set; }
        public int SaleId { get; set; }
        public int? ConstructorId { get; set; }
        public decimal Amount { get; set; }
        public DateTime? PlannedDate { get; set; }
        public string Status { get; set; } = "PENDENTE";
        public string Observations { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
