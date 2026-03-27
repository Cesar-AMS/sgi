namespace JMImoveisAPI.Entities
{
    public sealed class Proposal
    {
        public ulong Id { get; set; }
        public long EmpreendimentoId { get; set; }
        public long UnidadeId { get; set; }
        public decimal VlrUnidade { get; set; }
        public bool EngCaixa { get; set; }
        public string ClienteName { get; set; } = "";
        public DateTime? DateNascimento { get; set; }
        public string CnpjCpf { get; set; } = "";
        public string? Rg { get; set; }
        public string? EmailCliente { get; set; }
        public string? PhoneOne { get; set; }
        public string? PhoneTwo { get; set; }
        public string? EstadoCivil { get; set; }
        public string? Profissao { get; set; }
        public string? Renda { get; set; }

        public string? ClienteNameSecondary { get; set; }
        public DateTime? DataNascimentoSecondary { get; set; }
        public string? CnpjCpfSecondary { get; set; }
        public string? RgSecondary { get; set; }
        public string? EmailClienteSecondary { get; set; }
        public string? PhoneOneSecondary { get; set; }
        public string? PhoneTwoSecondary { get; set; }
        public string? EstadoCivilSecondary { get; set; }
        public string? ProfissaoSecondary { get; set; }
        public string? RendaSecondary { get; set; }

        public string? Cep { get; set; }
        public string? Rua { get; set; }
        public string? Nro { get; set; }
        public string? Comp { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }
        public string? Estado { get; set; }

        public long? CorretorId { get; set; }
        public long? GerenteId { get; set; }

        public string Status { get; set; } = "OPEN"; // ou usar ProposalStatus e converter para string no repo

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string? EnterPriseName { get; set; }
        public string? UnitName { get; set; }
        public List<ProposalCondition> Condicao { get; set; } = new();
    }

    public sealed class ProposalCondition
    {
        public ulong Id { get; set; }
        public ulong ProposalId { get; set; }
        public int Qtde { get; set; }
        public string? Descricao { get; set; }
        public DateTime Vencimento { get; set; } // vindo "yyyy-MM-dd"
        public decimal ValorParcela { get; set; }
        public decimal ValorTotal { get; set; }   // redundância
    }

    public enum ProposalStatus
    {
        OPEN,
        APPROVED,
        REJECTED,
        CANCELLED
    }

    // DTOs de entrada (alinhados ao seu TypeScript)
    public sealed class CondicaoDto
    {
        public int Qtde { get; set; }
        public string? Descricao { get; set; }
        public string Vencimento { get; set; } = ""; // yyyy-MM-dd
        public decimal ValorParcela { get; set; }
        public decimal ValorTotal { get; set; }
    }

    public sealed class PropostaReservaDto
    {
        public string EmpreendimentoID { get; set; } = "";
        public string UnidadeID { get; set; } = "";
        public decimal VlrUnidade { get; set; }
        public bool EngCaixa { get; set; }

        public string ClienteName { get; set; } = "";
        public string? DateNascimento { get; set; }           // yyyy-MM-dd
        public string CnpjCPF { get; set; } = "";
        public string? Rg { get; set; }
        public string? EmailCliente { get; set; }
        public string? Phoneone { get; set; }
        public string? Phonetwo { get; set; }
        public string? Estadocivil { get; set; }
        public string? Profissao { get; set; }
        public string? Renda { get; set; }

        public string? ClienteNameSecondary { get; set; }
        public string? DataNascimentoSecondary { get; set; }   // yyyy-MM-dd
        public string? CnpjCPFSecondary { get; set; }
        public string? RgSecondary { get; set; }
        public string? EmailClienteSecondary { get; set; }
        public string? PhoneoneSecondary { get; set; }
        public string? PhonetwoSecondary { get; set; }
        public string? EstadocivilSecondary { get; set; }
        public string? ProfissaoSecondary { get; set; }
        public string? RendaSecondary { get; set; }

        public string? Cep { get; set; }
        public string? Rua { get; set; }
        public string? Nro { get; set; }
        public string? Comp { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }
        public string? Estado { get; set; }

        public string CorretorID { get; set; } = "";
        public string GerenteID { get; set; } = "";
        public List<CondicaoDto> Condicao { get; set; } = new();

        // opcionalmente permitir cliente definir status inicial
        public string? Status { get; set; }
    }


    public class ParcelDto
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public decimal Value { get; set; }
        public DateTime Date { get; set; }
        public string? Observations { get; set; }
        public string Status { get; set; } = "WAITING"; // WAITING | PAID
        public string Type { get; set; } = "DEFAULT";   // ACT | DEFAULT | INTERMEDIARY
        public DateTime? PaidDate { get; set; }
    }
}
