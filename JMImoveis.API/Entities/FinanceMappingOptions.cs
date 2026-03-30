namespace JMImoveisAPI.Entities
{
    public record FinanceMappingOptions(
    int SeriesIdReceivables,
    int SeriesIdPayables,
    int CategoryActs,             // categoria p/ ATOS (receita)
    int CategoryInstallments,     // categoria p/ Parcelas do cliente (receita)
    int CategoryRealtor,          // categoria p/ Comissão Corretor (despesa)
    int CategoryManager,          // categoria p/ Comissão Gerente (despesa)
    int CategoryFinancial,        // categoria p/ Comissão Financeira (despesa)
    int AccountReceivables,       // conta contábil p/ receber
    int AccountPayables,          // conta contábil p/ pagar
    int CostCenterActs = 1,       // cost center para Acts (fixado 1 como você pediu)
    int? ClientId = null          // Id do cliente vinculado (pode vir de sale.CustomerId)
);
}
