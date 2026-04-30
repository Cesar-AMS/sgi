import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from '../core/session/session.service';
import { Unidade, CreateUnidade, UpdateUnidade, StatusConfig, StatusUnidade } from '../models/unidade.model';
import { UpdateStatus } from '../models/update-status.model';

@Injectable({
    providedIn: 'root'
})
export class UnidadeService {
    private readonly baseUrl = 'http://localhost:9920/api/Apartament';

    constructor(
        private http: HttpClient,
        private sessionService: SessionService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.sessionService.getToken();
        return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    }

    private mapStatus(status: string): StatusUnidade {
        const normalizedStatus = (status || '').toString().toUpperCase();

        switch (normalizedStatus) {
            case 'RESERVED':
            case 'RESERVADA':
                return 'reservada';
            case 'SELL':
            case 'SOLD':
            case 'VENDIDA':
                return 'vendida';
            case 'OPEN':
            case 'AVAILABLE':
            case 'DISPONIVEL':
            default:
                return 'disponivel';
        }
    }

    private mapUnidade(item: any): Unidade {
        const status = this.mapStatus(item.status);

        return {
            id: item.id,
            numero: item.number?.toString() ?? '',
            andar: Number(item.floor ?? item.andar ?? 0),
            area: item.size,
            dormitorios: item.dormitories,
            valor: item.value,
            perfilRenda: item.income ?? item.perfilRenda ?? item.his,
            status,
            statusTexto: StatusConfig[status].texto,
            statusCor: StatusConfig[status].cssClass,
            empreendimentoId: item.enterpriseId
        };
    }

    getAll(): Observable<Unidade[]> {
        return this.http.get<any[]>(this.baseUrl, { headers: this.getHeaders() })
            .pipe(map(data => data.map(item => this.mapUnidade(item))));
    }

    getById(id: number): Observable<Unidade> {
        return this.http.get<any>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
            .pipe(map(item => this.mapUnidade(item)));
    }

    getDisponiveis(): Observable<Unidade[]> {
        return this.http.get<any[]>(`${this.baseUrl}/disponiveis`, { headers: this.getHeaders() })
            .pipe(map(data => data.map(item => this.mapUnidade(item))));
    }

    getByEmpreendimentoId(empreendimentoId: number): Observable<Unidade[]> {
        return this.http.get<any[]>(`${this.baseUrl}?enterpriseId=${empreendimentoId}`, { headers: this.getHeaders() })
            .pipe(map(data => data.map(item => this.mapUnidade(item))));
    }

    getByConstrutoraId(construtoraId: number): Observable<Unidade[]> {
        return this.http.get<any[]>(`${this.baseUrl}?enterpriseId=${construtoraId}`, { headers: this.getHeaders() })
            .pipe(map(data => data.map(item => this.mapUnidade(item))));
    }

    create(data: CreateUnidade): Observable<Unidade> {
        return this.http.post<Unidade>(this.baseUrl, data, { headers: this.getHeaders() });
    }

    update(id: number, data: UpdateUnidade): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() });
    }

    updateStatus(id: number, data: UpdateStatus): Observable<void> {
        return this.http.patch<void>(`${this.baseUrl}/${id}/status`, data, { headers: this.getHeaders() });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
    }
}
