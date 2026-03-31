import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { AccountSummaryResponse, Entry, EntryKind, ReclassifyRequest } from 'src/app/models/contas';

@Injectable({ providedIn: 'root' })
export class AccountAnalysisService {
  private readonly receivablesUrl = `${BACKEND_API_URL}api/Receivables`;

  constructor(private http: HttpClient) {}

  private get authHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  getSummary(opts: {
    start: string;
    end: string;
    type?: 'all' | 'revenue' | 'expense';
    costCenterId?: number;
    categoryId?: number;
  }): Observable<AccountSummaryResponse> {
    let params = new HttpParams()
      .set('start', opts.start)
      .set('end', opts.end);

    if (opts.type) params = params.set('type', opts.type);
    if (opts.costCenterId != null) params = params.set('costCenterId', String(opts.costCenterId));
    if (opts.categoryId != null) params = params.set('categoryId', String(opts.categoryId));

    return this.http.get<AccountSummaryResponse>(`${this.receivablesUrl}/ac/summary`, {
      headers: this.authHeaders,
      params,
    });
  }

  getEntries(
    accountId: number,
    opts: {
      start: string;
      end: string;
      type?: 'all' | 'revenue' | 'expense';
      costCenterId?: number;
      categoryId?: number;
    }
  ): Observable<Entry[]> {
    let params = new HttpParams()
      .set('start', opts.start)
      .set('end', opts.end);

    if (opts.type) params = params.set('type', opts.type);
    if (opts.costCenterId != null) params = params.set('costCenterId', String(opts.costCenterId));
    if (opts.categoryId != null) params = params.set('categoryId', String(opts.categoryId));

    return this.http.get<Entry[]>(`${this.receivablesUrl}/ac/${accountId}/entries`, {
      headers: this.authHeaders,
      params,
    });
  }

  reclassify(kind: EntryKind, id: number, body: ReclassifyRequest): Observable<void> {
    return this.http.put<void>(`${this.receivablesUrl}/${kind}/${id}/reclassify`, body, {
      headers: this.authHeaders,
    });
  }
}
