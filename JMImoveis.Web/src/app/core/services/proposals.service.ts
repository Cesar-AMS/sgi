import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { PropostaReserva } from 'src/app/models/proposta-reserva';

export interface FiltrarPropostasDTO {
  de?: string;
  ate?: string;
  status?: string;
  gerente?: number | string;
  coordenador?: number | string;
  corretor?: number | string;
  construtora?: number | string;
  empreendimento?: number | string;
}

export interface PropostaResponseDTO {
  id: number;
  corretorNome: string;
  clienteName: string;
  unitName: string;
  enterPriseName: string;
  vlrUnidade: number;
  status: string;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class ProposalsService {
  private readonly proposalsUrl = `${BACKEND_API_URL}api/Propostas`;

  constructor(private http: HttpClient) {}

  list(params: FiltrarPropostasDTO): Observable<PropostaReserva[]> {
    return this.listarComFiltros(params);
  }

  listarComFiltros(params: FiltrarPropostasDTO): Observable<PropostaReserva[]> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.get<PropostaReserva[]>(this.proposalsUrl, {
      params: this.buildParams(params),
      headers,
    });
  }

  listarComFiltrosResponse(params: FiltrarPropostasDTO): Observable<PropostaResponseDTO[]> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.get<PropostaResponseDTO[]>(this.proposalsUrl, {
      params: this.buildParams(params),
      headers,
    });
  }

  cleanFilters<T extends Record<string, unknown>>(filtros: T): Partial<T> {
    const cleaned: Partial<T> = {};

    Object.entries(filtros || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === 'ALL') {
        return;
      }

      cleaned[key as keyof T] = value as T[keyof T];
    });

    return cleaned;
  }

  private buildParams(params: FiltrarPropostasDTO): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === 'ALL') {
        return;
      }

      httpParams = httpParams.set(key, String(value));
    });

    return httpParams;
  }

  getById(id: number): Observable<PropostaReserva> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.get<PropostaReserva>(`${this.proposalsUrl}/${id}`, {
      headers,
    });
  }

  create(body: PropostaReserva | unknown) {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.post(this.proposalsUrl, body, { headers });
  }


  update(id: number, body: PropostaReserva | unknown) {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.put(`${this.proposalsUrl}/${id}`, body, { headers });
  }
  enviarParaAnalise(id: number) {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.post(`${this.proposalsUrl}/${id}/enviar-para-analise`, null, {
      headers,
    });
  }

  approve(id: number) {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.patch(`${this.proposalsUrl}/${id}/aprovar`, null, {
      headers,
    });
  }

  reprovar(id: number) {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.post(`${this.proposalsUrl}/${id}/reprovar`, null, {
      headers,
    });
  }
}


