export type LeadStatus =
  | 'Novo'
  | 'Em Contato'
  | 'Em Negociação'
  | 'Ganhou'
  | 'Perdeu';

export type LeadEtapaAtendimento =
  | 'Sem atendimento'
  | 'Em atendimento'
  | 'Agendamento de retorno'
  | 'Visita agendada'
  | 'Visita concluída';

export interface Lead {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  status: LeadStatus;
  etapaAtendimento?: LeadEtapaAtendimento | null;
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
  etapaAtendimento?: LeadEtapaAtendimento | null;
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
  type?: string;
}

export interface LeadDocument {
  id: number;
  leadId: number;
  originalFileName: string;
  displayName: string;
  description?: string | null;
  contentType: string;
  fileSize: number;
  uploadedByUserId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  isEditing?: boolean;
}

export interface LeadTransferHistory {
  id: number;
  leadId: number;
  previousSellerId?: number | null;
  newSellerId?: number | null;
  previousCoordinatorId?: number | null;
  newCoordinatorId?: number | null;
  previousManagerId?: number | null;
  newManagerId?: number | null;
  changedByUserId?: number | null;
  changeReason?: string | null;
  createdAt: string;
  previousSellerName?: string | null;
  newSellerName?: string | null;
  previousCoordinatorName?: string | null;
  newCoordinatorName?: string | null;
  previousManagerName?: string | null;
  newManagerName?: string | null;
  changedByUserName?: string | null;
}
