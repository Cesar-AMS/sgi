using System.ComponentModel.DataAnnotations.Schema;

namespace JMImoveisAPI.Entities
{
    public sealed class Cliente
    {
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; } = null!;

        [Column("cpf_cnpj")]
        public string? CpfCnpj { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("cellphone")]
        public string? Cellphone { get; set; }

        [Column("cellphone2")]
        public string? Cellphone2 { get; set; }

        [Column("cep")]
        public string? Cep { get; set; }

      
        [Column("address-number")]
        public string? AddressNumber { get; set; }

        [Column("complement")]
        public string? Complement { get; set; }

        [Column("neighborhood")]
        public string? Neighborhood { get; set; }

        [Column("city")]
        public string? City { get; set; }

        [Column("state")]
        public string? State { get; set; }

        [Column("type")]
        public string? Type { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("profession")]
        public string? Profession { get; set; }

        [Column("income")]
        public string? Income { get; set; }

        [Column("id_titular")]
        public int? IdTitular { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
