namespace JMImoveisAPI.Entities
{
    public class Atos
    {
        public int Id { get; set; }
        public int VendaId { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public DateTime Data { get; set; }
        public string Descricao { get; set; } = string.Empty;
    }
}
