namespace JMImoveisAPI.Entities
{
    public class Visita
    {
        public int Id { get; set; }
        public int ClienteId { get; set; }
        public string ClienteName { get; set; } = string.Empty;
        public int RealtorId { get; set; }
        public DateTime Data { get; set; }
        public string Origem { get; set; } = string.Empty;
        public bool HasVenda { get; set; }
        public string Observacao { get; set; } = string.Empty;
    }
}
