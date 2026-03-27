export type VisitaStatus = 'Agendada' | 'Confirmada' | 'Realizada' | 'Cancelada';

export interface Visita {
  id: number;
  nomeCliente: string;
  dataHoraISO: string;
  vendedorId: string | null;

  status: VisitaStatus;
  observacao: string;

  compareceu: boolean;
  virouVenda: boolean;
}
