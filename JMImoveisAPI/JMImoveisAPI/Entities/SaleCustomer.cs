namespace JMImoveisAPI.Entities
{
    public class SaleCustomer
    {
        public int Id { get; set; }
        public int SaleId { get; set; }
        public int CustomerId { get; set; }
        public DateTime? DeletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
