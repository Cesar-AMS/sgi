export interface LeadInterestRegion {
  id: number;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateLeadInterestRegionRequest {
  name: string;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface UpdateLeadInterestRegionRequest {
  name: string;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface ToggleLeadInterestRegionRequest {
  isActive: boolean;
}
