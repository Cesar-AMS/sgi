import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { CreditAnalysis } from 'src/app/models/credit-analysis.model';

@Injectable({ providedIn: 'root' })
export class CreditAnalysisService {
  private readonly baseUrl = `${BACKEND_API_URL}api/credit-analysis`;

  constructor(private http: HttpClient) {}

  private get headers() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  getBySaleId(saleId: number): Observable<CreditAnalysis> {
    return this.http.get<CreditAnalysis>(`${this.baseUrl}/sale/${saleId}`, {
      headers: this.headers,
    });
  }

  create(analysis: CreditAnalysis): Observable<CreditAnalysis> {
    return this.http.post<CreditAnalysis>(this.baseUrl, analysis, {
      headers: this.headers,
    });
  }

  update(analysis: CreditAnalysis): Observable<void> {
    return this.http.put<void>(this.baseUrl, analysis, {
      headers: this.headers,
    });
  }
}
