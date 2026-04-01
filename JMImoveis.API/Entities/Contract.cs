namespace JMImoveisAPI.Entities
{
    public class Contract
    {
        public int? Id { get; set; }
        public int SaleId { get; set; }
        public string Number { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string Status { get; set; } = "PENDENTE";
        public string Observations { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
