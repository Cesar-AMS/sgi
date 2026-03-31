namespace JMImoveisAPI.Entities
{
    public class CreditAnalysis
    {
        public int Id { get; set; }
        public int SaleId { get; set; }
        public int? CustomerId { get; set; }
        public string Status { get; set; } = "PENDENTE";
        public string Summary { get; set; } = string.Empty;
        public string Restrictions { get; set; } = string.Empty;
        public string Observations { get; set; } = string.Empty;
        public int? AnalystUserId { get; set; }
        public string AnalystName { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
