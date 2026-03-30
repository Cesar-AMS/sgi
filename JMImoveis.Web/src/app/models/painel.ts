export type MesKey =
  'Jan'|'Fev'|'Mar'|'Abr'|'Mai'|'Jun'|'Jul'|'Ago'|'Set'|'Out'|'Nov'|'Dez';

export type TabKey =
  'vendas' | 'ajuda' | 'comissoes' | 'premiacoes' | 'vale' | 'totalPagar' | 'inadimplente';

export interface LinhaMatriz<T = number> {
  nome: string;                               // ex.: vendedor/colaborador
  valores: Partial<Record<MesKey, T>>;        // Jan..Dez
}

export interface MatrizResponse<T = number> {
  linhas: LinhaMatriz<T>[];
}

export interface NovoLancamento {
  tab: TabKey;             // aba alvo
  colaboradorId: number;
  compet: string;          // 'YYYY-MM'
  valor?: number;          // usado nas abas financeiras
  quantidade?: number;     // usado na aba 'vendas'
  observacao?: string;
}
