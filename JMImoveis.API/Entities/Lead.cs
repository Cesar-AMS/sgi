using System.Text.Json.Serialization;

namespace JMImoveisAPI.Entities
{
    public class Lead
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? Status { get; set; }
        public decimal? Valor { get; set; }
        public string? Fonte { get; set; }
        public string? ImoveisInteresse { get; set; }
        public string? Vendedor { get; set; }
        public string? Coordenador { get; set; }
        public string? Gerente { get; set; }
        public DateTime DataCriacao { get; set; } = DateTime.Now;
        public string? Observacao { get; set; }
    }


    public enum LeadStatus
    {
        Novo = 1,
        EmContato = 2,
        EmNegociacao = 3,
        Ganhou = 4,
        Perdeu = 5
    }

    public class LeadFilter
    {
        public string? Term { get; set; }
        public string? Status { get; set; }
        public string? Vendedor { get; set; }
        public string? Coordenador { get; set; }
        public string? Gerente { get; set; }
        public DateTime? StartAt { get; set; }
        public DateTime? FinishAt { get; set; }
    }


    public class LeadActivity
    {
        public int Id { get; set; }
        public int LeadId { get; set; }
        public DateTime DateTime { get; set; }
        public string Description { get; set; } = string.Empty;

        public string? Author { get; set; }
        public string? Type { get; set; }

        public DateTime CreatedAt { get; set; }
    }

    public class CreateLeadActivityRequest
    {
        public int LeadId { get; set; }
        public DateTime DateTime { get; set; }
        public string Description { get; set; } = string.Empty;

        public string? Author { get; set; }
        public string? Type { get; set; }
    }

    public class LeadSchedule
    {
        public int Id { get; set; }
        public int LeadId { get; set; }

        public DateTime ScheduledAt { get; set; }
        public string? Note { get; set; }

        public string Status { get; set; } = "Pendente"; // Pendente | Cumprido | NaoCumprido

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
    public class CreateLeadScheduleRequest
    {
        public int LeadId { get; set; }
        public string NameClient { get; set; } = string.Empty;
        public int UserId { get; set; }
        public DateTime ScheduledAt { get; set; }
        public string? Note { get; set; }
    }

    public class LeadScheduleV3
    {
        public int Id { get; set; }
        public int LeadId { get; set; }

        public DateTime ScheduledAt { get; set; } // dataHoraISO

        public string? Note { get; set; } // observacao
        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public int UserId { get; set; } // vendedorId
        public int? CoordenadorId { get; set; }
        public int? GerenteId { get; set; }

        public string NameClient { get; set; } = string.Empty;

        public bool Compareceu { get; set; }
        public bool VirouVenda { get; set; }
    }

    public class LeadScheduleRequest
    {
        public int? LeadId { get; set; }
        public string? NomeCliente { get; set; }
        public DateTime DataHoraISO { get; set; }
        public int VendedorId { get; set; }
        public string? Status { get; set; }
        public string? Observacao { get; set; }
        public bool? Compareceu { get; set; }
        public bool? VirouVenda { get; set; }
        public string? TipoAgenda { get; set; }
    }

    public class VisitaDto
    {
        public int Id { get; set; }
        public int? LeadId { get; set; }
        public int VendedorId { get; set; }          // vendedorId
        public string NomeCliente { get; set; } = string.Empty;   // nomeCliente
        public DateTime DataHoraISO { get; set; }
        public string? Observacao { get; set; }        // observacao
        public string Status { get; set; } = string.Empty;
        public bool Compareceu { get; set; }
        public bool VirouVenda { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }


    public class UpdateLeadScheduleStatusRequest
    {
        public int Id { get; set; }
        public int LeadId { get; set; }
        public string Status { get; set; } = "Pendente"; // Pendente | Cumprido | NaoCumprido
    }


    public class VisitaPatchRequest
    {
        [JsonPropertyName("nomeCliente")]
        public string? NomeCliente { get; set; }

        [JsonPropertyName("dataHoraISO")]
        public DateTime? DataHoraISO { get; set; }

        [JsonPropertyName("vendedorId")]
        public int? VendedorId { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("observacao")]
        public string? Observacao { get; set; }

        [JsonPropertyName("compareceu")]
        public bool? Compareceu { get; set; }

        [JsonPropertyName("virouVenda")]
        public bool? VirouVenda { get; set; }
    }

}
