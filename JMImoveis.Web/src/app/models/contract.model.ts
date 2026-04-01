export interface Contract {
  id?: number;
  saleId: number;
  number: string;
  path: string;
  status: string;
  observations: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
