import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DreResponse } from 'src/app/models/ContaBancaria';
import { BACKEND_API_URL } from './backend-api-url';

export type DreQuery = {
  startDate: string;
  endDate: string;
  categoryId?: number;
  costCenterId?: number;
};

@Injectable({ providedIn: 'root' })
export class DreService {
  private readonly baseUrl = `${BACKEND_API_URL}api/Receivables/dre`;

  constructor(private http: HttpClient) {}

  getDre(query: DreQuery): Observable<DreResponse> {
    let params = new HttpParams()
      .set('startDate', query.startDate)
      .set('endDate', query.endDate);

    if (query.categoryId != null) {
      params = params.set('categoryId', String(query.categoryId));
    }

    if (query.costCenterId != null) {
      params = params.set('costCenterId', String(query.costCenterId));
    }

    return this.http.get<DreResponse>(this.baseUrl, { params });
  }
}
