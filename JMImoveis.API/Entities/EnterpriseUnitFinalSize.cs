namespace JMImoveisAPI.Entities
{
    public class EnterpriseUnitFinalSize
    {
        public long Id { get; set; }
        public long EnterpriseId { get; set; }
        public int UnitFinal { get; set; }
        public decimal SizeM2 { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
