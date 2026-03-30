namespace JMImoveisAPI.Entities
{
    public class AccountBank
    {
        public int Id { get; set; }
        public string? Description { get; set; }
        public decimal? Amount { get; set; }            // saldo inicial
        public bool? Active { get; set; }
        public string? Account { get; set; }
        public string? Agency { get; set; }
        public decimal AmountActual { get; set; }      // saldo atual
        public DateTime? CreateAt { get; set; }
        public int? UserId { get; set; }
        public string? Type_key { get; set; }
        public string? Key_value { get; set; }
    }
}
