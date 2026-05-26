import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CashFlowGroupBy, CashFlowResponse } from 'src/app/models/financial-cash-flow';
import { BACKEND_API_URL } from './backend-api-url';

@Injectable({
  providedIn: 'root',
})
export class FinancialCashFlowService {
  private readonly baseUrl = `${BACKEND_API_URL}api/Financial/cash-flow`;

  constructor(private http: HttpClient) {}

  getCashFlow(params: { from: string; to: string; groupBy: CashFlowGroupBy }): Observable<CashFlowResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    const httpParams = new HttpParams()
      .set('from', params.from)
      .set('to', params.to)
      .set('groupBy', params.groupBy);

    return this.http.get<CashFlowResponse>(this.baseUrl, { headers, params: httpParams });
  }
}
