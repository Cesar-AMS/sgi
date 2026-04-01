import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { Contract } from 'src/app/models/contract.model';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private readonly baseUrl = `${BACKEND_API_URL}api/contracts`;

  constructor(private http: HttpClient) {}

  private get headers() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  getBySaleId(saleId: number): Observable<Contract> {
    return this.http.get<Contract>(`${this.baseUrl}/sale/${saleId}`, {
      headers: this.headers,
    });
  }

  create(contract: Contract): Observable<Contract> {
    return this.http.post<Contract>(this.baseUrl, contract, {
      headers: this.headers,
    });
  }

  update(contract: Contract): Observable<void> {
    return this.http.put<void>(this.baseUrl, contract, {
      headers: this.headers,
    });
  }
}
