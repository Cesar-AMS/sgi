export interface LeadSource {
  id: number;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateLeadSourceRequest {
  name: string;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface UpdateLeadSourceRequest {
  name: string;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface ToggleLeadSourceRequest {
  isActive: boolean;
}
