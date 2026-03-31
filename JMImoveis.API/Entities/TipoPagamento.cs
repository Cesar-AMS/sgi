namespace JMImoveisAPI.Entities
{
    public class TipoPagamento
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}
