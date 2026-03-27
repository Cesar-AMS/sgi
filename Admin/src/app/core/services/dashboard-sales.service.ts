import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';

export interface SalesByMonthDto {
    month: number;      // 1..12
    quantity: number;
    totalValue: number;
}

export interface SalesByEntityDto {
    id: number;
    name?: string | null;
    quantity: number;
    totalValue: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardSalesService {
    private readonly base = `${BACKEND_API_URL}api/dash/sales`;

    constructor(private http: HttpClient) { }

    byMonth(year: number): Observable<SalesByMonthDto[]> {
        const params = new HttpParams().set('year', year);

        var headerToken = {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        };


        return this.http.get<SalesByMonthDto[]>(`${this.base}/by-month`, { params, headers: headerToken });
    }

    byRealtor(year: number, month: number): Observable<SalesByEntityDto[]> {
        const params = new HttpParams().set('year', year).set('month', month);

         var headerToken = {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        };

        return this.http.get<SalesByEntityDto[]>(`${this.base}/by-realtor`, { params, headers: headerToken });
    }

    byManager(year: number, month: number): Observable<SalesByEntityDto[]> {
        const params = new HttpParams().set('year', year).set('month', month);

         var headerToken = {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        };

        return this.http.get<SalesByEntityDto[]>(`${this.base}/by-manager`, { params, headers: headerToken });
    }

    byCoordenator(year: number, month: number): Observable<SalesByEntityDto[]> {
        const params = new HttpParams().set('year', year).set('month', month);
        
        var headerToken = {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        };

        return this.http.get<SalesByEntityDto[]>(`${this.base}/by-coordenator`, { params, headers: headerToken });
    }

    byBranch(year: number, month: number): Observable<SalesByEntityDto[]> {
        const params = new HttpParams().set('year', year).set('month', month);

        var headerToken = {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        };

        return this.http.get<SalesByEntityDto[]>(`${this.base}/by-branch`, { params, headers: headerToken });
    }
}
