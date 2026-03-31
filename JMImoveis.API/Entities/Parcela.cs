namespace JMImoveisAPI.Entities
{
    public class Parcela
    {
        public int Id { get; set; }
        public int VendaId { get; set; }
        public decimal Valor { get; set; }
        public DateTime Vencimento { get; set; }
        public string Situacao { get; set; } = string.Empty;
    }
}
