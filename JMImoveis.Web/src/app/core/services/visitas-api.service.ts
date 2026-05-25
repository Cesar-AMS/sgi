import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Visita } from 'src/app/models/visita';
import { BACKEND_API_URL } from './backend-api-url';

export interface CreateScheduleResponse {
  id: number;
  leadId: number;
}

@Injectable({ providedIn: 'root' })
export class VisitasApiService {
  private readonly baseUrl = `${BACKEND_API_URL}api/`;
 
  constructor(private http: HttpClient) {}

  list(filters?: {
    q?: string;
    vendedorId?: string;
    status?: string;
    compareceu?: boolean;
    virouVenda?: boolean;
    startAt?: string;
    finishAt?: string;
    tipoAgenda?: string;
  }): Observable<Visita[]> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') return;
        params = params.set(k, String(v));
      });
    }

    return this.http.get<Visita[]>(`${this.baseUrl}Leads/schedule`, { params });
  }

  create(payload: Omit<Visita, 'id'>): Observable<CreateScheduleResponse> {
    
    return this.http.post<CreateScheduleResponse>(`${this.baseUrl}Leads/schedule`, payload);
  }

  update(id: number, patch: Partial<Visita>): Observable<Visita> {
    return this.http.put<Visita>(`${this.baseUrl}Leads/schedule/${id}`, patch);
  }

  /*export interface Visita {
    id: number;
    nomeCliente: string;
    dataHoraISO: string;
    vendedorId: string | null;
  
    status: VisitaStatus;
    observacao: string;
  
    compareceu: boolean;
    virouVenda: boolean;
  }*/

  cancel(id: number): Observable<Visita> {
    return this.update(id, { status: 'Cancelada' });
  }

  remove(id: number): Observable<Visita> {
    return this.cancel(id);
  }
}
