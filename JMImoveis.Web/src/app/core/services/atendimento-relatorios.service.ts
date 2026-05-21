import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import {
  AtendimentoRelatorioResponse,
  AtendimentoRelatorioResumoParams,
} from 'src/app/models/atendimento-relatorio';

@Injectable({ providedIn: 'root' })
export class AtendimentoRelatoriosService {
  private readonly baseUrl = `${BACKEND_API_URL}api/Atendimento/relatorios`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  }

  getResumo(params?: AtendimentoRelatorioResumoParams): Observable<AtendimentoRelatorioResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          return;
        }

        httpParams = httpParams.set(key, String(value));
      });
    }

    return this.http.get<AtendimentoRelatorioResponse>(`${this.baseUrl}/resumo`, {
      headers: this.getAuthHeaders(),
      params: httpParams,
    });
  }
}