// src/app/sales/services/sales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale } from 'src/app/models/sale.mode';
import { Parcel } from 'src/app/pages/project/vendas/vendas-new/vendas-new.component';
import { BACKEND_API_URL } from './backend-api-url';
import { Sales } from 'src/app/models/ContaBancaria';


@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly salesUrl = `${BACKEND_API_URL}api/Venda`;
  private readonly financialSalesUrl = `${BACKEND_API_URL}api/Financial/sales`;

  constructor(private http: HttpClient) { }

  getOpportunityList(filter: {
    startAt: string;
    finishAt: string;
    enterpriseId: number;
    filialId: number;
    clienteId: number;
    status: string;
    managementId: number;
  }): Observable<Sales[]> {
    const headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.post<Sales[]>(`${this.salesUrl}/filters`, filter, { headers: headerToken });
  }

  getFullById(id: number): Observable<Sales> {
    const headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.get<Sales>(`${this.salesUrl}/sales/${id}/full`, { headers: headerToken });
  }

  getOpportunityById(id: number): Observable<Sales> {
    return this.getFullById(id);
  }

  getById(id: number): Observable<Sale> {
     var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.get<Sale>(`${this.salesUrl}/sales/${id}/full`, { headers: headerToken });
  }

  createWithParcels(sale: Sale, parcels: Parcel[], customerIds: number[]) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post(this.financialSalesUrl, { sale, parcels, customerIds }, { headers: headerToken });
  }

  createOpportunity(sale: Sale, parcels: Parcel[], customerIds: number[]) {
    return this.createWithParcels(sale, parcels, customerIds);
  }


  getParcelsBySaleId(id: number) {
     var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Parcel[]>(`${this.salesUrl}/${id}/parcels`, { headers: headerToken });
  }

  getCustomerIdsBySaleId(id: number) {
     var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<number[]>(`${this.salesUrl}/${id}/customers`, { headers: headerToken });
  }

  /*create(sale: Sale): Observable<{ saleId: number }> {
    return this.http.post<{ saleId: number }>(this.baseUrl, { sale, parcels: [] });
  }*/

  update(id: number, sale: Sale): Observable<void> {
     var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.put<void>(this.salesUrl, sale, { headers: headerToken });
  }

  updateOpportunity(id: number, sale: Sale): Observable<void> {
    return this.update(id, sale);
  }

  updateOpportunityStatus(id: number, sale: Sale, status: string): Observable<void> {
    return this.updateOpportunity(id, {
      ...sale,
      status,
    });
  }

  closeOpportunity(id: number, sale: Sale): Observable<void> {
    return this.updateOpportunity(id, {
      ...sale,
      status: 'APPROVED',
    });
  }
}
