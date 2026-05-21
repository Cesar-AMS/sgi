export interface AtendimentoRelatorioResponse {
  resumo: AtendimentoRelatorioResumo;
  conversoes: AtendimentoRelatorioConversoes;
  agrupamentos: AtendimentoRelatorioAgrupamentos;
  funilPorVendedor: AtendimentoRelatorioFunil[];
  funilPorCoordenador: AtendimentoRelatorioFunil[];
  funilPorGerente: AtendimentoRelatorioFunil[];
  rankings: AtendimentoRelatorioRankings;
}

export interface AtendimentoRelatorioResumo {
  totalLeads: number;
  totalAgendamentos: number;
  totalVisitas: number;
  visitasRealizadas: number;
  comparecimentos: number;
  virouVenda: number;
}

export interface AtendimentoRelatorioConversoes {
  leadParaAgendamento: number;
  agendamentoParaVisita: number;
  visitaParaRealizada: number;
  visitaParaComparecimento: number;
  visitaParaVenda: number;
}

export interface AtendimentoRelatorioAgrupamentos {
  leadsPorStatus: AtendimentoRelatorioGrupo[];
  leadsPorEtapa: AtendimentoRelatorioGrupo[];
  agendamentosPorStatus: AtendimentoRelatorioGrupo[];
  visitasPorStatus: AtendimentoRelatorioGrupo[];
}

export interface AtendimentoRelatorioGrupo {
  label: string;
  total: number;
}

export interface AtendimentoRelatorioFunil {
  nome: string;
  leads: number;
  agendamentos: number;
  visitas: number;
  realizadas: number;
  compareceu: number;
  virouVenda: number;
  conversaoLeadAgendamento: number;
  conversaoAgendamentoVisita: number;
  conversaoVisitaVenda: number;
}

export interface AtendimentoRelatorioRankings {
  topLeads: AtendimentoRelatorioRanking[];
  topAgendamentos: AtendimentoRelatorioRanking[];
  topVisitas: AtendimentoRelatorioRanking[];
  topVirouVenda: AtendimentoRelatorioRanking[];
  topConversaoVisitaVenda: AtendimentoRelatorioRanking[];
}

export interface AtendimentoRelatorioRanking {
  posicao: number;
  nome: string;
  valor: number;
  percentual: number;
  detalhe?: string | null;
}

export interface AtendimentoRelatorioResumoParams {
  startAt?: string | null;
  finishAt?: string | null;
  vendedorId?: string | number | null;
  coordenadorId?: string | number | null;
  gerenteId?: string | number | null;
}