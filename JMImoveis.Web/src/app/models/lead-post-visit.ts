export type LeadPostVisitStatus =
  | 'AGENDOU_RETORNO'
  | 'OPORTUNIDADE_FUTURA'
  | 'ACOMPANHANDO'
  | 'EM_PROPOSTA'
  | 'FECHOU_VENDA';

export interface LeadPostVisitListItem {
  postVisitId: number;
  leadId: number;
  nomeCliente: string;
  telefone?: string | null;
  email?: string | null;
  cpf?: string | null;
  postVisitStatus: LeadPostVisitStatus;
  nextFollowUpAt?: string | null;
  attendingAgentId?: number | null;
  attendingAgentName?: string | null;
  interestRegion?: string | null;
  downPaymentAmount?: number | null;
  propertyInterestType?: string | null;
  lastInteractionSummary?: string | null;
  proposalId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface LeadPostVisit {
  id: number;
  leadId: number;
  cpf?: string | null;
  hasRestriction?: boolean | null;
  incomeType?: string | null;
  interestRegion?: string | null;
  paysRent?: boolean | null;
  maritalStatus?: string | null;
  downPaymentAmount?: number | null;
  attendingAgentId?: number | null;
  propertyInterestType?: string | null;
  postVisitStatus: LeadPostVisitStatus;
  nextFollowUpAt?: string | null;
  lastInteractionSummary?: string | null;
  proposalId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface LeadPostVisitRequest {
  cpf?: string | null;
  hasRestriction?: boolean | null;
  incomeType?: string | null;
  interestRegion?: string | null;
  paysRent?: boolean | null;
  maritalStatus?: string | null;
  downPaymentAmount?: number | null;
  attendingAgentId?: number | null;
  propertyInterestType?: string | null;
  postVisitStatus?: LeadPostVisitStatus | null;
  nextFollowUpAt?: string | null;
  lastInteractionSummary?: string | null;
  proposalId?: number | null;
}

export interface LeadPostVisitFilters {
  status?: LeadPostVisitStatus | '' | null;
  agentId?: number | string | null;
  search?: string | null;
  followUpFrom?: string | null;
  followUpTo?: string | null;
}
