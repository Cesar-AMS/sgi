namespace JMImoveisAPI.Entities
{
    public class ExtractAccountBank
    {
        public int Id { get; set; }
        public int IdAccount { get; set; }
        public string? Description { get; set; }
        public decimal Value { get; set; }          // +crédito / -débito
        public DateTime CreateDate { get; set; }
        public int? UserId { get; set; }
        public bool Status { get; set; }
    }

    // Models/Category.cs
    public class Category
    {
        public int Id { get; set; }
        public string Description { get; set; } = null!;
        public bool Status { get; set; }
    }

    // Models/AccountPlain.cs
    public class AccountPlain
    {
        public int Id { get; set; }
        public string Account { get; set; } = null!;
        public string? Description { get; set; }
        public int? IdCategory { get; set; }
        public string? TypeAccount { get; set; }     // RECEITA/DESPESA...
    }
}
