namespace JMImoveisAPI.Entities
{
    public class Usuario
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public DateTime? EmailVerifiedAt { get; set; }
        public string? Password { get; set; }
        public string? RememberToken { get; set; }
        public bool? Hidden { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Cpf { get; set; }
        public string? Address { get; set; }
        public string? Cellphone { get; set; }
        public DateTime? AdmissionDate { get; set; }
        public string? Token { get; set; }
        public string? Commissioned { get; set; }
        public string? TpCommissioned { get; set; }
        public decimal? ValueCommissioned { get; set; }
        public decimal? ValueCommissionedMax { get; set; }
        public List<int>? JobpositionId { get; set; }
        public int? Filial { get; set; }
        public int? EnterpriseVisibility { get; set; }

        public int? CoordenatorId { get; set; }
        public int? ManagerId { get; set; }
        public int? GestorId { get; set; }
        public string? MenuJson { get; set; }
    }

    public class UsuarioDTO
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Cargo { get; set; } = string.Empty;
        public bool Status { get; set; }
    }

    public class MenuItemDto
    {
        public int Id { get; set; }
        public string Label { get; set; } = "";
        public string? Icon { get; set; }
        public string? Link { get; set; }
        public bool IsTitle { get; set; }
        public List<MenuItemDto>? SubItems { get; set; }
    }
}
