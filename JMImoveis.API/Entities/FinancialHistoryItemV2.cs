using System;

namespace JMImoveisAPI.Entities
{
    public class FinancialHistoryItemV2
    {
        public string Kind { get; set; } = string.Empty;           // "RECEIVE" ou "PAY"
        public long Id { get; set; }
        public long SaleId { get; set; }
        public long? UserId { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PayDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal PendingAmount { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class AccountsPayableQuery
    {
        public DateTime? DueFrom { get; set; }
        public DateTime? DueTo { get; set; }

        public long? UserId { get; set; }
        public long? SaleId { get; set; }

        public string? Category { get; set; }
        public string? Status { get; set; }
        public string? Search { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class CreateAccountsPayableRequest
    {
        public long? SaleId { get; set; }
        public long? UserId { get; set; }

        public DateTime? CreateDate { get; set; } // data de competência/lançamento
        public DateTime? DueDate { get; set; }
        public DateTime? PayDate { get; set; }

        public string Description { get; set; } = "";
        public string Status { get; set; } = "WAITING"; // WAITING | PAID
        public string Category { get; set; } = "";

        public decimal Amount { get; set; }
        public decimal PendingAmount { get; set; }

        public string? Observations { get; set; }
    }

    public class SettleAccountsPayableRequest
    {
        public decimal PaidValue { get; set; }
        public DateTime PaidDate { get; set; }
        public string? Observations { get; set; }
    }

    public class AccountsPayableRowDto
    {
        public long Id { get; set; }
        public long? SaleId { get; set; }
        public long? UserId { get; set; }

        public DateTime? CreateDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? PayDate { get; set; }

        public string Description { get; set; } = "";
        public string Status { get; set; } = "";
        public string Category { get; set; } = "";

        public decimal Amount { get; set; }
        public decimal PendingAmount { get; set; }

        public string? Observations { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class AccountsPayableSummaryDto
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


}
