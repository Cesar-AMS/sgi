namespace JMImoveisAPI.Entities
{
    public class DreGroup
    {
    }

    public sealed class DreRequest
    {
        public DateTime StartDate { get; set; }   // ex: 2025-08-01
        public DateTime EndDate { get; set; }     // ex: 2025-08-31
        public int? CategoryId { get; set; }
        public int? CostCenterId { get; set; }
    }

    public sealed class DreLine
    {
        public int AccountId { get; set; }

        public string Section { get; set; } = string.Empty;

        public string AccountCode { get; set; } = string.Empty;

        public string AccountName { get; set; } = string.Empty;

        public decimal TotalReceita { get; set; }

        public decimal TotalDespesa { get; set; }

        public decimal TotalLiquido { get; set; }
    }



    public sealed class DreTotals
    {
        public decimal GrossRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal OperatingResult => GrossRevenue - TotalExpenses;
    }

    public sealed class DreResponse
    {
        public DreTotals Totals { get; set; } = new();
        public List<DreLine> Lines { get; set; } = new();
    }


    public sealed class CostCenter
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
    }
    public sealed class CostCenterSummary
    {
        public int CostCenterId { get; set; }
        public string CostCenterName { get; set; } = "";
        public decimal Revenue { get; set; }
        public decimal Expense { get; set; }
        public decimal Net => Revenue - Expense;
    }
    public sealed class SummaryResponse
    {
        public List<CostCenterSummary> Items { get; set; } = new();
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal TotalNet => TotalRevenue - TotalExpense;
    }

    public enum EntryKind { RECEIVABLE, PAYABLE }
    public sealed class Entry
    {
        public int Id { get; set; }
        public EntryKind Kind { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; } = "";
        public int AccountId { get; set; }
        public string AccountCode { get; set; } = "";
        public string AccountName { get; set; } = "";
        public int? CategoryId { get; set; }
        public int CostCenterId { get; set; }
        public string? CostCenterName { get; set; }
        public decimal Amount { get; set; }
    }
    public sealed class ReclassifyRequest
    {
        public int CostCenterId { get; set; }
        public int? AccountId { get; set; }
        public int? CategoryId { get; set; }
        public string? Reason { get; set; }
    }

    public sealed class AccountOption
    {
        public int Id { get; set; }
        public string Code { get; set; } = "";
        public string Description { get; set; } = "";
    }

}
