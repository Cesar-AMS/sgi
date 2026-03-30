namespace JMImoveisAPI.Entities
{
    public class Constructor
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int? Empreendimentos { get; set; }
        public int? Unidades { get; set; }
        public int? Vendidos { get; set; }
        public int? Reservados { get; set; }
        public int? Disponiveis { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
