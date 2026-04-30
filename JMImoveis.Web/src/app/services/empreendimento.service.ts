import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from '../core/session/session.service';
import { Empreendimento, CreateEmpreendimento, UpdateEmpreendimento, CountResponse } from '../models/empreendimento.model';

@Injectable({
    providedIn: 'root'
})
export class EmpreendimentoService {
    private readonly baseUrl = 'http://localhost:9920/api/Empreendimento';

    constructor(
        private http: HttpClient,
        private sessionService: SessionService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.sessionService.getToken();
        return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    }

    getAll(): Observable<Empreendimento[]> {
        return this.http.get<any[]>(this.baseUrl, { headers: this.getHeaders() })
            .pipe(map(data => data.map(item => this.mapEmpreendimento(item))));
    }

    getById(id: number): Observable<Empreendimento> {
        return this.http.get<any>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
            .pipe(map(item => this.mapEmpreendimento(item)));
    }

    getByConstrutoraId(construtoraId: number): Observable<Empreendimento[]> {
        return this.http.get<any[]>(`${this.baseUrl}/constructor?enterpriseId=${construtoraId}`, { headers: this.getHeaders() })
            .pipe(
                map(data => data.map(item => this.mapEmpreendimento(item)))
            );
    }

    countByConstrutoraId(construtoraId: number): Observable<CountResponse> {
        return this.http.get<CountResponse>(`${this.baseUrl}/CountByConstrutora/${construtoraId}`, { headers: this.getHeaders() });
    }

    create(data: CreateEmpreendimento): Observable<Empreendimento> {
        return this.http.post<Empreendimento>(this.baseUrl, data, { headers: this.getHeaders() });
    }

    update(id: number, data: UpdateEmpreendimento): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
    }

    private mapEmpreendimento(item: any): Empreendimento {
        return {
            id: item.id,
            nome: item.name,
            endereco: item.address,
            construtoraId: item.constructorId,
            nomeConstrutora: item.constructorName ?? item.constructor,
            dataCriacao: item.createdAt,
            telefone: item.phone ?? item.telefone,
            email: item.email,
            cidade: item.city ?? item.cidade,
            estado: item.state ?? item.estado,
            cep: item.zipCode ?? item.cep,
            bairro: item.neighborhood ?? item.bairro,
            tipo: item.type ?? item.tipo,
            status: item.workStatus ?? item.statusObra ?? item.status,
            numeroTorres: item.towersNumber ?? item.numeroTorres,
            numeroUnidades: item.unitsNumber ?? item.numeroUnidades,
            areaTotal: item.totalArea ?? item.areaTotal,
            dataLancamento: item.launchDate ?? item.dataLancamento,
            dataEntregaPrevista: item.expectedDeliveryDate ?? item.dataEntregaPrevista,
            incorporador: item.developer ?? item.incorporador,
            cnpjIncorporador: item.developerCnpj ?? item.cnpjIncorporador,
            registroCRI: item.criRegistration ?? item.registroCRI,
            alvaraNumero: item.permitNumber ?? item.alvaraNumero,
            habitese: item.habiteSe ?? item.habitese,
            dataAprovacao: item.approvalDate ?? item.dataAprovacao,
            responsavelTecnico: item.technicalResponsible ?? item.responsavelTecnico,
            descricao: item.description ?? item.descricao,
            observacoes: item.observations ?? item.observacoes
        };
    }
}
