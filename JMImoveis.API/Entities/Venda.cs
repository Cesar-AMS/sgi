using static System.Runtime.InteropServices.JavaScript.JSType;

namespace JMImoveisAPI.Entities
{
    public class Venda
    {
        public int Id { get; set; }
        public int IdImovel { get; set; }
        public int IdEmpreendimento { get; set; }
        public int IdFilial { get; set; }
        public int IdCliente { get; set; }
        public decimal PercentualComissao { get; set; }
        public decimal ValorComissao { get; set; }
        public decimal ValorUnidade { get; set; }
        public int IdCorretor { get; set; }
        public int IdGerente { get; set; }
        public string Contrato { get; set; } = string.Empty;
        public string NumeroContrato { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime DataVenda { get; set; }
        public int IdFormasPagamento { get; set; }
        public int QtdeParcelas { get; set; }
        public DateTime DtInicio { get; set; }
        public decimal ValorParcelas { get; set; }
        public decimal PercentualComissaoFinanceiro { get; set; }
        public decimal ValorComissaoFinanceiro { get; set; }
        public string StatusComissaoFinanceiro { get; set; } = string.Empty;
        public decimal ValorImpostos { get; set; }
        public string StatusImpostos { get; set; } = string.Empty;
        public bool GerarAlertaBoleto { get; set; }
    }


    public class VendasV2
    {
        public int Id { get; set; }
        public decimal UnitValue { get; set; }
        public decimal StartValue { get; set; }
        public decimal? ValueToConstructor { get; set; } // Pode ser nulo, portanto o tipo é decimal?
        public decimal PercentageToRealtor { get; set; }
        public decimal PercentageToManager { get; set; }
        public DateTime? ParcelsStart { get; set; } // Pode ser nulo
        public decimal RealtorComission { get; set; }
        public decimal? RealtorComissionRemaining { get; set; } // Pode ser nulo
        public string RealtorComissionStatus { get; set; } // PAID, WAITING, etc.
        public decimal ManagerComission { get; set; }
        public decimal? ManagerComissionRemaining { get; set; } // Pode ser nulo
        public string? ManagerComissionStatus { get; set; } // PAID, WAITING, etc.
        public bool? GenerateNotification { get; set; }
        public DateTime? NotificatedDate { get; set; } // Pode ser nulo
        public decimal? NetEarnings { get; set; }
        public decimal? GrossEarnings { get; set; }
        public string? ContractPath { get; set; } // Caminho do contrato
        public string? Status { get; set; } // OPEN, FAILED, etc.
        public int? BranchId { get; set; }
        public int EnterpriseId { get; set; }
        public int? UnitId { get; set; }
        public int? RealtorId { get; set; }
        public int? ManagerId { get; set; }
        public int? PaymentTypesId { get; set; }
        public DateTime? SelledAt { get; set; }
        public DateTime? DeletedAt { get; set; } // Pode ser nulo
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public decimal? ValueToRealstate { get; set; }
        public decimal? PercentageToRealstate { get; set; }
        public decimal? PercentageToFinancial { get; set; }
        public decimal? FinancialComission { get; set; }
        public string? FinancialComissionStatus { get; set; } // PAID, WAITING, etc.
        public decimal? PercentageToTax { get; set; }
        public decimal? TaxComission { get; set; }
        public string? TaxComissionStatus { get; set; } = "WAITING";// PAID, WAITING, etc.
        public string? ContractNumber { get; set; } // Número do contrato
        public string? Cliente { get; set; }
        public string? Corretor { get; set; }
        public string? Gerente { get; set; }
        public string? EnterpriseName { get; set; }
        public string? BranchName { get; set; }
        public string? UnitName { get; set; }
        public int? CustomerId { get; set; } //ID DO CLIENTE PARA INSERT NA sales_custormers
        public int? CoordenatorId { get; set; }

        public double? CoordenatorComission { get; set; }
        public decimal? PercentageToCoordenator { get; set; }
        public string? CoordenatorComissionStatus { get; set; }
        public string? Coordenador { get; set; }
        public string? EmailCustomer { get; set; }
        public string? PhoneCustomer { get; set; }
        public string? CpfCnpj { get; set; }
        public List<Acts?>? Acts { get; set; }
        public List<Installaments?>? Intermediarias { get; set; }
        public List<Installaments?>? Parcelas { get; set; }
        public List<Installaments?>? PlainCorretor { get; set; }
        public List<Installaments?>? PlainManager { get; set; } 
    }

    public class SalesFilters
    {
        public string? StartAt { get; set; }
        public string? FinishAt { get; set; }
        public int EnterpriseId { get; set; }
        public int FilialId { get; set; }
        public int ClienteId { get; set; }
        public string Status { get; set; }
        public int ManagementId { get; set; }
    }

    public class Installaments
    {
        public int? Id { get; set; }
        public decimal? VlrInstallament { get; set; }
        public string? DueDate { get; set; }
        public string? DtPayment { get; set; }
        public string? Obs { get; set; }
        public string? Status { get; set; }
    }

    public class Acts
    {
        public int? Id { get; set; }
        public int? Parcel { get; set; }
        public decimal? Value { get; set; }
        public DateTime? Date { get; set; }
        public string? Observations { get; set; }
        public int? SourceId { get; set; }
        public string? Status { get; set; }
        public int? PaymentId { get; set; }
        public DateTime? PaidDate { get; set; }
    }

    public class _ReceivableInstallView
    {
        public int? Id { get; set; }
        public decimal? VlrInstallament { get; set; }
        public string? DueDate { get; set; }
        public string? DtPayment { get; set; }
        public string? Obs { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
    }

    public class _PayableInstallView
    {
        public int? Id { get; set; }
        public int? IdInstallment { get; set; }
        public decimal? VlrInstallament { get; set; }
        public string? DueDate { get; set; }
        public string? DtPayment { get; set; }
        public string? Obs { get; set; }
        public string? Status { get; set; }
    }
}
