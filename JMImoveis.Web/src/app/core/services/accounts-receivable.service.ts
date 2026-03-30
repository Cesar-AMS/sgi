import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';

export interface AccountsReceivableRow {
  id: number;
  saleId?: number | null;
  branchId?: number | null;
  createdAt: string;
  dueDate: string;
  paidDate?: string | null;
  description: string;
  status: 'WAITING' | 'PAID' | 'CANCELLED';
  category: string;
  amount: number;
  pendingAmount: number;
  observations?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AccountsReceivableService {
  private readonly baseUrl = `${BACKEND_API_URL}api/accounts-receivable`;

  constructor(private http: HttpClient) { }

  getPaged(query: any, page: number, pageSize: number): Observable<{ items: AccountsReceivableRow[]; total: number }> {
    let params = this.toParams(query)
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    return this.http.get<{ items: AccountsReceivableRow[]; total: number }>(this.baseUrl, { params });
  }

  settle(id: number, payload: { paidValue: number; paidDate: string; observations?: string | null }) {
    return this.http.post(`${this.baseUrl}/${id}/settle`, payload);
  }

  getSummary(query: any): Observable<any> {
    const params = this.toParams(query);
    return this.http.get<any>(`${this.baseUrl}/summary`, { params });
  }

  exportExcel(query: any) {
    const params = this.toParams(query);
    return this.http.get(`${this.baseUrl}/export/excel`, { params, responseType: 'blob' });
  }

  exportPdf(query: any) {
    const params = this.toParams(query);
    return this.http.get(`${this.baseUrl}/export/pdf`, { params, responseType: 'blob' });
  }

  create(payload: any) {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  private toParams(query: any): HttpParams {
    let p = new HttpParams();
    Object.keys(query || {}).forEach(k => {
      const v = query[k];
      if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
    });
    return p;
  }
}
