export interface ConstructorTransfer {
  id?: number;
  saleId: number;
  constructorId?: number | null;
  amount: number;
  plannedDate?: string | null;
  status: string;
  observations: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
