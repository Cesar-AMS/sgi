namespace JMImoveisAPI.Entities
{
    // Contracts/DashboardResponse.cs
    public sealed class DashboardResponse
    {
        public int VendasQtd { get; set; }
        public decimal DespesasTotal { get; set; }
        public decimal Ato { get; set; }
        public decimal Parcelas { get; set; }
        public decimal ReceitaBruta { get; set; }
        public decimal ReceitaLiquida { get; set; }

        public decimal Inad_pctMes { get; set; }
        public decimal Inad_pctTotal { get; set; }
        public int Inad_pagantes { get; set; }
        public decimal Inad_recebidos { get; set; }
        public int Inad_qtdMes { get; set; }
        public decimal Inad_valorAberto { get; set; }

        public SeriesData Vendas { get; set; } = new();
        public SeriesData Despesas { get; set; } = new();
    }

    public sealed class CorretorDashboardResponse
    {
        public List<ManagerOption> ManagerOptions { get; set; } = new();
        public int? DefaultManagerId { get; set; }

        public List<Row12> SalariosCorretores { get; set; } = new();
        public List<Row12> SalariosGerentes { get; set; } = new();
        public List<Row12> ComissoesCorretores { get; set; } = new();
        public List<Row12> ComissoesGerentes { get; set; } = new();
        public List<Row12> DespesasFiliais { get; set; } = new();
    }

    public sealed class ManagerOption
    {
        public int? Id { get; set; }   // null = Todos
        public string Label { get; set; } = "";
    }

    public sealed class Row12
    {
        public string Name { get; set; } = "";
        public decimal[] Values { get; set; } = new decimal[12];
    }

    public sealed class SeriesData
    {
        public List<string> Labels { get; set; } = new();
        public List<decimal> Values { get; set; } = new();
    }

    public sealed class DashboardOptions
    {
        public int CategoryActs { get; set; }
        public int CategoryInstallments { get; set; }
    }

    public sealed class CorretorDashboardOptions
    {
        public int CategoryRealtor { get; set; }  // categoria comissão do CORRETOR em payables
        public int CategoryManager { get; set; }  // categoria comissão do GERENTE  em payables
    }


    public sealed class SalesByMonthDto
    {
        public int Month { get; set; }         // 1..12
        public int Quantity { get; set; }      // COUNT(*)
        public decimal TotalValue { get; set; } // SUM(unit_value)
    }

    public sealed class SalesByEntityDto
    {
        public int Id { get; set; }            // realtor_id / manager_id / coordenator_id / branch_id
        public string? Name { get; set; }      // opcional (se fizer JOIN com tabela de nomes)
        public int Quantity { get; set; }
        public decimal TotalValue { get; set; }
    }

}
