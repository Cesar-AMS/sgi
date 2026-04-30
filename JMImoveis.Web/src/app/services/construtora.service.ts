import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from '../core/session/session.service';
import { Construtora, CreateConstrutora, UpdateConstrutora } from '../models/construtora.model';

@Injectable({
    providedIn: 'root'
})
export class ConstrutoraService {
    private readonly baseUrl = 'http://localhost:9920/api/Construtora';

    constructor(
        private http: HttpClient,
        private sessionService: SessionService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.sessionService.getToken();
        return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    }

    getAll(): Observable<Construtora[]> {
        return this.http.get<any[]>(this.baseUrl, { headers: this.getHeaders() })
            .pipe(
                map(data => data.map(item => this.mapConstrutora(item)))
            );
    }

    getById(id: number): Observable<Construtora> {
        return this.http.get<any>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
            .pipe(map(item => this.mapConstrutora(item)));
    }

    create(data: CreateConstrutora): Observable<Construtora> {
        return this.http.post<Construtora>(this.baseUrl, data, { headers: this.getHeaders() });
    }

    update(id: number, data: UpdateConstrutora): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
    }

    private mapConstrutora(item: any): Construtora {
        return {
            id: item.id,
            nome: item.name,
            endereco: item.address,
            telefone: item.phone ?? item.telefone,
            celular: item.cellphone ?? item.celular,
            email: item.email,
            site: item.site,
            cnpj: item.cnpj,
            inscricaoEstadual: item.stateRegistration ?? item.inscricaoEstadual,
            inscricaoMunicipal: item.municipalRegistration ?? item.inscricaoMunicipal,
            banco: item.bank ?? item.banco,
            agencia: item.agency ?? item.agencia,
            conta: item.account ?? item.conta,
            pix: item.pix,
            responsavel: item.responsible ?? item.responsavel,
            observacoes: item.observations ?? item.observacoes,
            dataCriacao: item.createdAt
        };
    }
}
