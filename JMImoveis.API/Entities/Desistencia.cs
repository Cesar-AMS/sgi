namespace JMImoveisAPI.Entities
{
    public class Desistencia
    {
        public int Id { get; set; }
        public int VendaId { get; set; }
        public DateTime Data { get; set; }
        public string Motivo { get; set; } = string.Empty;
    }
}
