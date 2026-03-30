export interface AccountSummary {
  accountId: number;
  section: 'RECEITA' | 'DESPESA';
  accountCode: string;
  accountName: string;
  revenue: number;
  expense: number;
  net: number; // (revenue - expense)
}

export interface AccountSummaryResponse {
  items: AccountSummary[];
  totalRevenue: number;
  totalExpense: number;
  totalNet: number;
}

export type EntryKind = 'RECEIVABLE' | 'PAYABLE';

export interface Entry {
  id: number;
  kind: EntryKind;
  date: string; // YYYY-MM-DD
  description: string;
  accountId: number;
  accountCode: string;
  accountName: string;
  categoryId?: number | null;
  costCenterId: number;
  costCenterName?: string;
  amount: number;
}

export interface ReclassifyRequest {
  costCenterId: number;
  accountId?: number | null;
  categoryId?: number | null;
  reason?: string | null;
}

export interface AccountOption {
  id: number;
  code: string;
  description: string;
}

export interface CostCenter {
  id: number;
  name: string;
}
