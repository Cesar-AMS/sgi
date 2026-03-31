import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { Cliente } from 'src/app/models/ContaBancaria';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly customersUrl = `${BACKEND_API_URL}api/Cliente`;

  constructor(private http: HttpClient) {}

  private get authHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  list(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.customersUrl, { headers: this.authHeaders });
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.customersUrl}/${id}`, { headers: this.authHeaders });
  }

  getDependentsByCustomerId(id: number): Observable<Cliente | null> {
    return this.http.get<Cliente | null>(`${this.customersUrl}/customers/${id}/dependents`);
  }

  create(customer: Cliente): Observable<number> {
    return this.http.post<number>(this.customersUrl, customer, { headers: this.authHeaders });
  }

  update(customer: Cliente): Observable<void> {
    return this.http.put<void>(this.customersUrl, customer, { headers: this.authHeaders });
  }

  delete(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.customersUrl}/${id}`, { headers: this.authHeaders });
  }

  linkDependent(customerId: number, dependentId: number): Observable<void> {
    return this.http.post<void>(
      `${this.customersUrl}/${customerId}/dependents/${dependentId}`,
      {},
      { headers: this.authHeaders }
    );
  }
}
