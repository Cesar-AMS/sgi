namespace JMImoveisAPI.Entities
{
    public class ApartmentUnit
    {
        public int Id { get; set; }
        public int Floor { get; set; }
        public string Block { get; set; } = null!;
        public int Number { get; set; }
        public decimal Value { get; set; }
        public string? Income { get; set; }           // ex.: "Permuta"
        public decimal Size { get; set; }
        public int Dormitories { get; set; }          // qtd de quartos
        public string Status { get; set; } = null!;   // OPEN | RESERVED | SELL
        public int EnterpriseId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool Active { get; set; }
    }
}
