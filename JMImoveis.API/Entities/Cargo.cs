namespace JMImoveisAPI.Entities
{
    public class Cargo
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime UpdatedAt  { get; set; }
        public DateTime CreatedAt  { get; set; }
        public string? Commissioned { get; set; }
        public string? TpCommissioned { get; set; }
        public decimal? ValueCommissioned { get; set; }
    }
}
