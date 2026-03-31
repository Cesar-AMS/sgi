import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { AccountOption, CostCenter, Entry, EntryKind, ReclassifyRequest, SummaryResponse } from 'src/app/models/CC';

@Injectable({ providedIn: 'root' })
export class CostCenterAnalysisService {
  private readonly receivablesUrl = `${BACKEND_API_URL}api/Receivables`;

  constructor(private http: HttpClient) {}

  private get authHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  getMonthlySummary(
    startDate: string,
    endDate: string,
    type: 'all' | 'revenue' | 'expense' = 'all'
  ): Observable<SummaryResponse> {
    const params = new HttpParams()
      .set('start', startDate)
      .set('end', endDate)
      .set('type', type);

    return this.http.get<SummaryResponse>(`${this.receivablesUrl}/cc/summary`, {
      params,
      headers: this.authHeaders,
    });
  }

  getEntries(
    costCenterId: number,
    startDate: string,
    endDate: string,
    type: 'all' | 'revenue' | 'expense' = 'all'
  ): Observable<Entry[]> {
    const params = new HttpParams()
      .set('start', startDate)
      .set('end', endDate)
      .set('type', type);

    return this.http.get<Entry[]>(`${this.receivablesUrl}/${costCenterId}/entries`, {
      params,
      headers: this.authHeaders,
    });
  }

  getCostCenters(): Observable<CostCenter[]> {
    return this.http.get<CostCenter[]>(`${this.receivablesUrl}/cc`, {
      headers: this.authHeaders,
    });
  }

  getAccounts(): Observable<AccountOption[]> {
    return this.http.get<AccountOption[]>(`${this.receivablesUrl}/accounts`, {
      headers: this.authHeaders,
    });
  }

  reclassify(kind: EntryKind, id: number, body: ReclassifyRequest): Observable<void> {
    return this.http.put<void>(`${this.receivablesUrl}/${kind}/${id}/reclassify`, body, {
      headers: this.authHeaders,
    });
  }
}
