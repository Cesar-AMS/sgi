namespace JMImoveisAPI.Entities
{
    public class UnidadeDto
    {
        public int Id { get; set; }
        public int IdEmpreendimento { get; set; }

        public int? Andar { get; set; }
        public string? Bloco { get; set; }
        public string? Numero { get; set; }

        public string? Mt2 { get; set; }
        public int? Dormitorios { get; set; }
        public decimal? Valor { get; set; }

        public string PerfilRenda { get; set; } = string.Empty;
        public string? Status { get; set; }
    }

}
