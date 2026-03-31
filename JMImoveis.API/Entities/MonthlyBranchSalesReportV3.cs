namespace JMImoveisAPI.Entities
{
    public class MonthlyBranchSalesReportV3
    {
        public long BranchId { get; set; }             // Filial
        public int Year { get; set; }                  // Ano
        public int Month { get; set; }                 // Mês (1-12)

        public decimal SalesValue { get; set; }        // ValorVenda
        public decimal TotalCommission { get; set; }   // ValorComissaoTotal

        public decimal ManagerCommission { get; set; }     // ComissaoGerente
        public decimal CoordinatorCommission { get; set; } // ComissaoCoordenador
        public decimal RealtorCommission { get; set; }     // ComissaoCorretor
    }

    public class UserPayableDetailV3
    {
        public long Id { get; set; }           // Id do lançamento de accounts_payable
        public long SaleId { get; set; }
        public long UserId { get; set; }

        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public DateTime DueDate { get; set; }
        public DateTime? PayDate { get; set; }

        public string Status { get; set; } = string.Empty;     // WAITING / PAID
        public decimal Amount { get; set; }
        public decimal PendingAmount { get; set; }
    }

    public class UserCategoryMonthlyPayablesSummaryV3
    {
        public long UserId { get; set; }
        public string Category { get; set; } = string.Empty;

        public int Year { get; set; }
        public int Month { get; set; }

        public int ItemsCount { get; set; }         // QtdeLancamentos
        public decimal TotalAmount { get; set; }    // ValorTotal
        public decimal PaidAmount { get; set; }     // ValorPago
        public decimal PendingAmount { get; set; }  // ValorPendente
    }

    public class UserMonthlyPayablesSummaryV3
    {
        public long UserId { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }

        public decimal TotalAmount { get; set; }    // ValorTotalMes
        public decimal PaidAmount { get; set; }     // ValorPagoMes
        public decimal PendingAmount { get; set; }  // ValorPendenteMes
    }
}
