namespace JMImoveisAPI.Entities
{
    public class PlanoDePgto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int QuantidadeParcelas { get; set; }
        public decimal Entrada { get; set; }
    }
}
