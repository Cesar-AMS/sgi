export interface CreditAnalysis {
  id?: number;
  saleId: number;
  customerId?: number | null;
  status: string;
  summary: string;
  restrictions: string;
  observations: string;
  analystUserId?: number | null;
  analystName: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
