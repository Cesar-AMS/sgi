namespace JMImoveisAPI.Entities
{
    public class AccountReceivableV2
    {
        public long Id { get; set; }
        public long SaleId { get; set; }
        public long? UserId { get; set; }          // IMOBILIÁRIA / FILIAL / etc.
        public DateTime CreateDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PayDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;         // WAITING / PAID
        public decimal Amount { get; set; }
        public decimal PendingAmount { get; set; }
        public string Category { get; set; } = string.Empty;       // ENTRADA, PARCELA, PARCELA ATO
        public int? ParcelNumber { get; set; }
        public string Observations { get; set; } = string.Empty;
    }

    public class AccountPayableV2
    {
        public long Id { get; set; }
        public long SaleId { get; set; }
        public long UserId { get; set; }           // corretor, gerente, coordenador, construtora, etc.
        public DateTime CreateDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PayDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;         // WAITING / PAID
        public decimal Amount { get; set; }
        public decimal PendingAmount { get; set; }
        public string Category { get; set; } = string.Empty;       // COMISSAO_CORRETOR, COMISSAO_GERENTE, etc.
        public string Observations { get; set; } = string.Empty;
    }

    public class AccountsReceivableRowDto
    {
        public int Id { get; set; }
        public int? SaleId { get; set; }
        public int? BranchId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? PaidDate { get; set; }

        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "WAITING";
        public string Category { get; set; } = string.Empty;

        public decimal Amount { get; set; }
        public decimal PendingAmount { get; set; }

        public string? Observations { get; set; }
    }

    public class CreateAccountsReceivableRequest
    {
        public int? SaleId { get; set; }
        public int? BranchId { get; set; }

        public DateTime? CompetenceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? PaidDate { get; set; }

        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "WAITING"; // WAITING | PAID | CANCELLED
        public string Category { get; set; } = string.Empty;

        public decimal Amount { get; set; }
        public decimal PendingAmount { get; set; }

        public string? Observations { get; set; }
    }

    public class AccountsReceivableQuery
    {
        public DateTime? DueFrom { get; set; }
        public DateTime? DueTo { get; set; }

        public int? BranchId { get; set; }
        public string? Category { get; set; }
        public string? Status { get; set; }

        public string? Search { get; set; } // description/observations/category
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int Total { get; set; }
    }

    public class AccountsReceivableSummaryDto
    {
        public int ProjectionTotal { get; set; }
        public decimal ProjectionValue { get; set; }

        public int OpenTotal { get; set; }
        public decimal OpenValue { get; set; }

        public int DueTodayTotal { get; set; }
        public decimal DueTodayValue { get; set; }

        public int DueMonthTotal { get; set; }
        public decimal DueMonthValue { get; set; }

        public int OverdueTotal { get; set; }
        public decimal OverdueValue { get; set; }

        public int PaidMonthTotal { get; set; }
        public decimal PaidMonthValue { get; set; }
    }

    public class SettleAccountsReceivableRequest
    {
        public decimal PaidValue { get; set; }
        public DateTime? PaidDate { get; set; }
        public string? Observations { get; set; }
    }
}
