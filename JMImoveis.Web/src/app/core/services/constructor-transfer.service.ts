import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { ConstructorTransfer } from 'src/app/models/constructor-transfer.model';

@Injectable({ providedIn: 'root' })
export class ConstructorTransferService {
  private readonly baseUrl = `${BACKEND_API_URL}api/constructor-transfers`;

  constructor(private http: HttpClient) {}

  private get headers() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  getBySaleId(saleId: number): Observable<ConstructorTransfer> {
    return this.http.get<ConstructorTransfer>(`${this.baseUrl}/sale/${saleId}`, {
      headers: this.headers,
    });
  }

  create(item: ConstructorTransfer): Observable<ConstructorTransfer> {
    return this.http.post<ConstructorTransfer>(this.baseUrl, item, {
      headers: this.headers,
    });
  }

  update(item: ConstructorTransfer): Observable<void> {
    return this.http.put<void>(this.baseUrl, item, {
      headers: this.headers,
    });
  }
}
