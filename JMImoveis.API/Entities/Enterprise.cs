namespace JMImoveisAPI.Entities
{
    public class Enterprise
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Address { get; set; } = null!;
        public int ConstructorId { get; set; }
        public string? Constructor { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool Hidden { get; set; }
    }

    public class UnitsEnterprise //Apartamento
    {
        public int? Id { get; set; }
        public string? Block { get; set; }
        public int? Floor { get; set; }
        public int? Number { get; set; }
        public decimal? Value { get; set; }
        public string? Size { get; set; }
        public string Dormitories { get; set; } = string.Empty;
        public int? Commission { get; set; }
        public int Active { get; set; }
    }
}
