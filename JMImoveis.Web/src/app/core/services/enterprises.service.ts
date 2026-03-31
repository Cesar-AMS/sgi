import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { Construtoras, Empreendimento } from 'src/app/models/ContaBancaria';

@Injectable({ providedIn: 'root' })
export class EnterprisesService {
  private readonly enterpriseUrl = `${BACKEND_API_URL}api/Empreendimento`;
  private readonly constructorUrl = `${BACKEND_API_URL}api/Construtora`;

  constructor(private http: HttpClient) {}

  private get authHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  listEnterprises(): Observable<Empreendimento[]> {
    return this.http.get<Empreendimento[]>(this.enterpriseUrl, { headers: this.authHeaders });
  }

  getEnterpriseById(id: number): Observable<Empreendimento> {
    return this.http.get<Empreendimento>(`${this.enterpriseUrl}/${id}`, { headers: this.authHeaders });
  }

  createEnterprise(enterprise: Empreendimento): Observable<unknown> {
    return this.http.post(this.enterpriseUrl, enterprise, { headers: this.authHeaders });
  }

  updateEnterprise(id: number, enterprise: Empreendimento): Observable<unknown> {
    return this.http.put(`${this.enterpriseUrl}/${id}`, enterprise, { headers: this.authHeaders });
  }

  listConstructors(): Observable<Construtoras[]> {
    return this.http.get<Construtoras[]>(this.constructorUrl, { headers: this.authHeaders });
  }

  getConstructorById(id: number): Observable<Construtoras> {
    return this.http.get<Construtoras>(`${this.constructorUrl}/${id}`, { headers: this.authHeaders });
  }

  createConstructor(constructor: Partial<Construtoras>): Observable<unknown> {
    return this.http.post(this.constructorUrl, constructor, { headers: this.authHeaders });
  }

  updateConstructor(id: number, constructor: Partial<Construtoras>): Observable<unknown> {
    return this.http.put(`${this.constructorUrl}/${id}`, constructor, { headers: this.authHeaders });
  }
}
