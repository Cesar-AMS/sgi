export interface CostCenterSummary {
  costCenterId: number;
  costCenterName: string;
  revenue: number;
  expense: number;
  net: number;
}

export type EntryKind = 'RECEIVABLE' | 'PAYABLE';

export interface Entry {
  id: number;
  kind: EntryKind;             // 'RECEIVABLE' | 'PAYABLE'
  date: string;                // 'YYYY-MM-DD'
  description: string;
  accountId: number;
  accountCode: string;
  accountName: string;
  categoryId?: number | null;
  costCenterId: number;
  costCenterName?: string;
  amount: number;              // positivo
}

export interface ReclassifyRequest {
  costCenterId: number;
  accountId?: number | null;
  categoryId?: number | null;
  reason?: string | null;
}

export interface CostCenter {
  id: number;
  name: string;
}

export interface AccountOption {
  id: number;
  code: string;
  description: string;
}

export interface SummaryResponse {
  items: CostCenterSummary[];
  totalRevenue: number;
  totalExpense: number;
  totalNet: number;
}