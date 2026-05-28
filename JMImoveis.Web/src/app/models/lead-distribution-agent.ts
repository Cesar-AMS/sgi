export type LeadDistributionAgentLevel = 'NOVATO' | 'INTERMEDIARIO' | 'EXPERIENTE';

export interface LeadDistributionAgent {
  id: number;
  userId: number;
  userName?: string | null;
  isActive: boolean;
  level: LeadDistributionAgentLevel;
  priority: number;
  maxDailyLeads?: number | null;
  lastAssignedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateLeadDistributionAgentRequest {
  userId: number;
  isActive: boolean;
  level: LeadDistributionAgentLevel;
  priority?: number | null;
  maxDailyLeads?: number | null;
}

export interface UpdateLeadDistributionAgentRequest {
  isActive: boolean;
  level: LeadDistributionAgentLevel;
  priority?: number | null;
  maxDailyLeads?: number | null;
}

export interface ToggleLeadDistributionAgentRequest {
  isActive: boolean;
}
