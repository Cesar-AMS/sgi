export type LeadStatus =
  | 'Novo'
  | 'Em Contato'
  | 'Em Negociação'
  | 'Ganhou'
  | 'Perdeu';

export interface Lead {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  status: LeadStatus;
  valor?: number;
  fonte?: string;
  imoveisInteresse?: string;
  vendedor?: string;
  coordenador?: string;
  gerente?: string;
  dataCriacao: string; // ISO string
  observacao?: string;
}

export interface CreateLeadRequest {
  nome: string;
  email?: string;
  telefone?: string;
  status: LeadStatus | '';
  valor?: number | null;
  fonte?: string;
  imoveisInteresse?: string;
  vendedor?: string;
  observacao?: string;
}

export interface LeadActivity {
  id: number;
  leadId: number;
  dateTime: string; // ISO
  author?: string;
  type?: string; // "Nota", "Sistema", etc
  description: string;
}

export interface CreateLeadActivityRequest {
  leadId: number;
  dateTime: string; // ISO
  description: string;
}