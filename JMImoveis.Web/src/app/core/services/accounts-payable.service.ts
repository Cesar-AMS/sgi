import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BACKEND_API_URL } from './backend-api-url';

export interface AccountsPayableRow {
  id: number;
  saleId?: number | null;
  userId?: number | null;
  createDate?: string | null;
  dueDate?: string | null;
  paidDate?: string | null;
  description: string;
  status: 'WAITING' | 'PAID' | 'CANCELLED';
  category: string;
  amount: number;
  pendingAmount: number;
  observations?: string | null;
  createdAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AccountsPayableService {
  private readonly baseUrl = `${BACKEND_API_URL}api/accounts-payable`;
  
  constructor(private http: HttpClient) {}

  getPaged(query: any) {
    const params = this.toParams(query);
    return this.http.get<{ items: AccountsPayableRow[]; total: number }>(this.baseUrl, { params });
  }

  getSummary(query: any) {
    const params = this.toParams(query);
    return this.http.get<any>(`${this.baseUrl}/summary`, { params });
  }

  create(payload: any) {
    return this.http.post(this.baseUrl, payload);
  }

  settle(id: number, payload: { paidValue: number; paidDate: string; observations?: string | null }) {
    return this.http.post(`${this.baseUrl}/${id}/settle`, payload);
  }

  exportExcel(query: any) {
    const params = this.toParams(query);
    return this.http.get(`${this.baseUrl}/export/excel`, { params, responseType: 'blob' });
  }

  exportPdf(query: any) {
    const params = this.toParams(query);
    return this.http.get(`${this.baseUrl}/export/pdf`, { params, responseType: 'blob' });
  }

  private toParams(q: any): HttpParams {
    let p = new HttpParams();
    Object.keys(q || {}).forEach((k) => {
      const v = q[k];
      if (v !== null && v !== undefined && v !== '') {
        p = p.set(k, String(v));
      }
    });
    return p;
  }
}
