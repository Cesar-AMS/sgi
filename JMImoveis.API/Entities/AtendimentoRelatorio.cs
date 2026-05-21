namespace JMImoveisAPI.Entities
{
    public class AtendimentoRelatorioResponse
    {
        public AtendimentoRelatorioResumoDto Resumo { get; set; } = new();
        public AtendimentoRelatorioConversoesDto Conversoes { get; set; } = new();
        public AtendimentoRelatorioAgrupamentosDto Agrupamentos { get; set; } = new();
        public List<AtendimentoRelatorioFunilDto> FunilPorVendedor { get; set; } = new();
        public List<AtendimentoRelatorioFunilDto> FunilPorCoordenador { get; set; } = new();
        public List<AtendimentoRelatorioFunilDto> FunilPorGerente { get; set; } = new();
        public AtendimentoRelatorioRankingsDto Rankings { get; set; } = new();
    }

    public class AtendimentoRelatorioResumoDto
    {
        public int TotalLeads { get; set; }
        public int TotalAgendamentos { get; set; }
        public int TotalVisitas { get; set; }
        public int VisitasRealizadas { get; set; }
        public int Comparecimentos { get; set; }
        public int VirouVenda { get; set; }
    }

    public class AtendimentoRelatorioConversoesDto
    {
        public int LeadParaAgendamento { get; set; }
        public int AgendamentoParaVisita { get; set; }
        public int VisitaParaRealizada { get; set; }
        public int VisitaParaComparecimento { get; set; }
        public int VisitaParaVenda { get; set; }
    }

    public class AtendimentoRelatorioAgrupamentosDto
    {
        public List<AtendimentoRelatorioGrupoDto> LeadsPorStatus { get; set; } = new();
        public List<AtendimentoRelatorioGrupoDto> LeadsPorEtapa { get; set; } = new();
        public List<AtendimentoRelatorioGrupoDto> AgendamentosPorStatus { get; set; } = new();
        public List<AtendimentoRelatorioGrupoDto> VisitasPorStatus { get; set; } = new();
    }

    public class AtendimentoRelatorioGrupoDto
    {
        public string Label { get; set; } = string.Empty;
        public int Total { get; set; }
    }

    public class AtendimentoRelatorioFunilDto
    {
        public string Nome { get; set; } = string.Empty;
        public int Leads { get; set; }
        public int Agendamentos { get; set; }
        public int Visitas { get; set; }
        public int Realizadas { get; set; }
        public int Compareceu { get; set; }
        public int VirouVenda { get; set; }
        public int ConversaoLeadAgendamento { get; set; }
        public int ConversaoAgendamentoVisita { get; set; }
        public int ConversaoVisitaVenda { get; set; }
    }

    public class AtendimentoRelatorioRankingsDto
    {
        public List<AtendimentoRelatorioRankingDto> TopLeads { get; set; } = new();
        public List<AtendimentoRelatorioRankingDto> TopAgendamentos { get; set; } = new();
        public List<AtendimentoRelatorioRankingDto> TopVisitas { get; set; } = new();
        public List<AtendimentoRelatorioRankingDto> TopVirouVenda { get; set; } = new();
        public List<AtendimentoRelatorioRankingDto> TopConversaoVisitaVenda { get; set; } = new();
    }

    public class AtendimentoRelatorioRankingDto
    {
        public int Posicao { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Valor { get; set; }
        public int Percentual { get; set; }
        public string? Detalhe { get; set; }
    }
}