namespace JMImoveisAPI.Entities
{
    public class Visita
    {
        public int Id { get; set; }
        public int ClienteId { get; set; }
        public string ClienteName { get; set; }
        public int RealtorId { get; set; }
        public DateTime Data { get; set; }
        public string Origem { get; set; }
        public bool HasVenda { get; set; }
        public string Observacao { get; set; }
    }
}
