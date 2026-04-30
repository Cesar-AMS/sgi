namespace JMImoveisAPI.Entities
{
    public class Constructor
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Cellphone { get; set; }
        public string? Email { get; set; }
        public string? Site { get; set; }
        public string? Cnpj { get; set; }
        public string? StateRegistration { get; set; }
        public string? MunicipalRegistration { get; set; }
        public string? Bank { get; set; }
        public string? Agency { get; set; }
        public string? Account { get; set; }
        public string? Pix { get; set; }
        public string? Responsible { get; set; }
        public string? Observations { get; set; }
        public int? Empreendimentos { get; set; }
        public int? Unidades { get; set; }
        public int? Vendidos { get; set; }
        public int? Reservados { get; set; }
        public int? Disponiveis { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
