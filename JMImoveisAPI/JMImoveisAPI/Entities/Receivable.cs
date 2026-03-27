namespace JMImoveisAPI.Entities
{
    public class Receivable
    {
        public int? Id { get; set; }
        public int? SeriesId { get; set; }
        public int? InstallmentNo { get; set; }
        public decimal? Amount { get; set; }
        public string? Description { get; set; }
        public DateTime? CompetenceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public bool? Received { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public int? CategoryId { get; set; }
        public int? AccountId { get; set; }
        public int? ClientId { get; set; }
        public int? CostCenterId { get; set; }
        public string? Reference { get; set; }   // ADICIONAIS
        public string? Notes { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool? Recurrencing { get; set; }
        public string? Periodic { get; set; }
        public int? Parcelas { get; set; }
        public string? Status { get; set; }
        public string? CategoryName { get; set; } // SOMENTE CONSULTA
        public string? AccountName { get; set; } // SOMENTE CONSULTA
        public string? ClientName { get; set; } // SOMENTE CONSULTA
        public string? CenterCoustName { get; set; } // SOMENTE CONSULTA
        public string? TypeParcel { get; set; } // SOMENTE CONSULTA
    }

    public class Payable
    {
        public int? Id { get; set; }
        public int? SeriesId { get; set; }
        public int? InstallmentNo { get; set; }
        public decimal? Amount { get; set; }
        public string? Description { get; set; }
        public DateTime? CompetenceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public bool? Paid { get; set; }
        public DateTime? PaidDate { get; set; }
        public int? CategoryId { get; set; }
        public int? AccountId { get; set; }
        public int? ClientId { get; set; }
        public int? CostCenterId { get; set; }
        public string? Reference { get; set; }
        public string? Notes { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool? Recurrencing { get; set; }
        public string? Periodic { get; set; }
        public int? Parcelas { get; set; }
        public string? Status { get; set; }
        public string? CategoryName { get; set; } // SOMENTE CONSULTA
        public string? AccountName { get; set; } // SOMENTE CONSULTA
        public string? ClientName { get; set; } // SOMENTE CONSULTA
        public string? CenterCoustName { get; set; } // SOMENTE CONSULTA

    }

    public sealed class AccountSummary
    {
        public int AccountId { get; set; }
        public string Section { get; set; } = "";   // RECEITA | DESPESA (account_plain.typeaccount)
        public string AccountCode { get; set; } = "";
        public string AccountName { get; set; } = "";
        public decimal Revenue { get; set; }        // soma de receivables no período (filtros aplicados)
        public decimal Expense { get; set; }        // soma de payables no período (filtros aplicados)
        public decimal Net => Revenue - Expense;
    }

    public sealed class AccountSummaryResponse
    {
        public List<AccountSummary> Items { get; set; } = new();
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal TotalNet => TotalRevenue - TotalExpense;
    }

    public sealed class MarkAsReceivedRequest
    {
        public DateTime ReceivedDate { get; set; }         // yyyy-MM-dd
        public int? AccountId { get; set; }                // conta usada no recebimento
        public decimal Amount { get; set; }                // valor efetivamente recebido
        public string? Notes { get; set; }                 // opcional
    }

    // Application/Payables/MarkAsPaidRequest.cs
    public sealed class MarkAsPaidRequest
    {
        public DateTime PaidDate { get; set; }             // yyyy-MM-dd
        public int? AccountId { get; set; }                // conta usada no pagamento
        public decimal Amount { get; set; }                // valor efetivamente pago
        public string? Notes { get; set; }                 // opcional
    }
}
