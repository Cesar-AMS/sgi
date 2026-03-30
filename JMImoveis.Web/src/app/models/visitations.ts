
export interface VisitVm {
  id: number;
  customerName: string;
  customerNumber?: string | null;
  realtorId: number;
  realtorName: string;
  date: string;              // ISO
  sourceDescription: string;
  hasSell: boolean;
  observations?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Realtor {
  id: number;
  name: string;
}

export interface VisitVm {
  id: number;
  customerName: string;
  customerNumber?: string | null;
  realtorId: number;
  realtor: string;
  date: string;                // ISO (ex.: 2025-02-10T21:41:00Z)
  sourceDescription: string;
  hasSell: boolean;
  observations?: string | null;
}

/** Payload de criação/edição */
export interface VisitUpsert {
  customerName: string;
  customerNumber?: string | null;
  realtorId: number;
  date: string;               // ISO (junte no component dateOnly + timeOnly)
  sourceDescription: string;
  hasSell: boolean;
  observations?: string | null;
}

/** Resposta paginada do backend */
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Filtros de listagem */
export interface VisitsQuery {
  page?: number;
  pageSize?: number;
  q?: string;                 // busca livre
  date?: string;              // 'YYYY-MM-DD'
  realtor?: string;           // nome do corretor (troque para realtorId se preferir)
  realtorId?: number;         // use este se filtrar por ID
  hadSale?: boolean;          // true/false
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
