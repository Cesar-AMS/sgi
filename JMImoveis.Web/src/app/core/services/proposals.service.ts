import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { PropostaReserva } from 'src/app/models/proposta-reserva';

@Injectable({ providedIn: 'root' })
export class ProposalsService {
  private readonly proposalsUrl = `${BACKEND_API_URL}api/Propostas`;

  constructor(private http: HttpClient) {}

  list(params: {
    de?: string;
    ate?: string;
    gerente: number;
    corretor: number;
    status?: string;
  }): Observable<PropostaReserva[]> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    let httpParams = new HttpParams();
    if (params.de) httpParams = httpParams.set('de', params.de);
    if (params.ate) httpParams = httpParams.set('ate', params.ate);
    if (params.status && params.status !== 'ALL') {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<PropostaReserva[]>(this.proposalsUrl, {
      params: httpParams,
      headers,
    });
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


