import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { CorretorDashboardResponse } from 'src/app/models/ContaBancaria';

@Injectable({ providedIn: 'root' })
export class CommercialResultsService {
  private readonly baseUrl = `${BACKEND_API_URL}api/Venda/corretor`;

  constructor(private http: HttpClient) {}

  getBrokerDashboard(year: number, month: number, managerId: number | null): Observable<CorretorDashboardResponse> {
    let params = new HttpParams()
      .set('year', year)
      .set('month', month);

    if (managerId !== null && managerId !== undefined) {
      params = params.set('managerId', managerId);
    }

    return this.http.get<CorretorDashboardResponse>(this.baseUrl, { params });
  }
}
