namespace JMImoveisAPI.Entities
{
    public class AjudaDeCusto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public decimal Valor { get; set; }
        public DateTime Data { get; set; }
    }
}
