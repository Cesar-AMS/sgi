namespace JMImoveisAPI.Entities
{
    public class Notificacao
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Mensagem { get; set; } = string.Empty;
        public DateTime DataCriacao { get; set; }
    }
}
