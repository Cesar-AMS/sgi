export type VisitaStatus = 'Agendada' | 'Confirmada' | 'Realizada' | 'Cancelada' | 'Atrasado';

export interface Visita {
  id: number;
  leadId?: number | null;
  nomeCliente: string;
  telefone?: string | null;
  imoveisInteresse?: string | null;
  fonte?: string | null;
  dataHoraISO: string;
  vendedorId: string | null;
  vendedorNome?: string | null;
  coordenadorId?: number | null;
  coordenadorNome?: string | null;
  gerenteId?: number | null;
  gerenteNome?: string | null;
  tipoAgenda?: 'contato' | 'visita' | null;

  status: VisitaStatus;
  observacao: string;

  compareceu: boolean;
  virouVenda: boolean;
}
