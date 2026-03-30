namespace JMImoveisAPI.Entities
{
    public class Intermediarias
    {
        public int Id { get; set; }
        public int VendaId { get; set; }
        public decimal Valor { get; set; }
        public DateTime Vencimento { get; set; }
        public bool Quitada { get; set; }
    }
}
