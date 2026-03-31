import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { ContaReceberDto } from 'src/app/models/ContaBancaria';

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
  private readonly legacyReceivablesUrl = `${BACKEND_API_URL}api/Receivables`;

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

  listByPeriod(dtini: string, dtfim: string, typeFilter: string, categoriaFilter: string): Observable<ContaReceberDto[]> {
    const params = new HttpParams()
      .set('de', dtini)
      .set('ate', dtfim)
      .set('typeFilter', typeFilter)
      .set('categoriaFilter', categoriaFilter);

    return this.http.get<ContaReceberDto[]>(`${this.legacyReceivablesUrl}/periodo`, { params });
  }

  createLegacy(payload: any) {
    return this.http.post(this.legacyReceivablesUrl, payload);
  }

  updateLegacy(id: number, payload: any) {
    return this.http.patch(`${this.legacyReceivablesUrl}/${id}`, payload);
  }

  markAsReceived(id: number, body: { receivedDate: string; accountId: number | null; amount: number; }) {
    return this.http.post(`${this.legacyReceivablesUrl}/${id}/pay`, body);
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
