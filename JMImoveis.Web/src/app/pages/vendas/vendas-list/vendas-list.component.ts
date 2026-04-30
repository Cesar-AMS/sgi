import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginationModule, PageChangedEvent } from 'ngx-bootstrap/pagination';

import { ApiService } from 'src/app/core/services/api.service';
import { SalesService } from 'src/app/core/services/sales.service';
import { Empreendimento, Filial, Sales, Usuarios } from 'src/app/models/ContaBancaria';

@Component({
    selector: 'app-vendas-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, PaginationModule],
    templateUrl: './vendas-list.component.html',
    styleUrls: ['./vendas-list.component.scss']
})
export class VendasListComponent implements OnInit {
    carregando = false;
    vendas: Sales[] = [];
    vendasFiltradas: Sales[] = [];
    vendasPaginadas: Sales[] = [];

    empreendimentos: Empreendimento[] = [];
    filiais: Filial[] = [];
    gerentes: Usuarios[] = [];

    filtros = {
        inicio: this.toDateInput(new Date(new Date().setDate(new Date().getDate() - 90))),
        fim: this.toDateInput(new Date()),
        empreendimentoId: 0,
        filialId: 0,
        gerenteId: 0,
        status: 'ABC',
        cliente: ''
    };

    page = 1;
    itemsPerPage = 50;
    totalItems = 0;
    perPageOptions = [25, 50, 100, 150];

    constructor(
        private apiService: ApiService,
        private salesService: SalesService
    ) {}

    ngOnInit(): void {
        this.carregarCombos();
        this.buscarVendas();
    }

    carregarCombos(): void {
        this.apiService.getEmpreendimentos().subscribe(data => this.empreendimentos = data || []);
        this.apiService.getFiliais().subscribe(data => this.filiais = data || []);
        this.apiService.getGerentes().subscribe(data => this.gerentes = data || []);
    }

    buscarVendas(): void {
        this.carregando = true;

        this.salesService.getOpportunityList({
            startAt: this.filtros.inicio,
            finishAt: this.filtros.fim,
            enterpriseId: Number(this.filtros.empreendimentoId || 0),
            filialId: Number(this.filtros.filialId || 0),
            clienteId: 0,
            status: this.filtros.status,
            managementId: Number(this.filtros.gerenteId || 0)
        }).subscribe({
            next: data => {
                this.vendas = data || [];
                this.aplicarFiltroLocal();
            },
            error: error => {
                console.error('Erro ao buscar vendas', error);
            },
            complete: () => {
                this.carregando = false;
            }
        });
    }

    aplicarFiltroLocal(): void {
        const cliente = this.filtros.cliente.trim().toLowerCase();

        this.vendasFiltradas = this.vendas.filter(venda =>
            !cliente || (venda.cliente || '').toLowerCase().includes(cliente)
        );

        this.totalItems = this.vendasFiltradas.length;
        this.page = 1;
        this.atualizarPagina();
    }

    onPageChanged(event: PageChangedEvent): void {
        this.page = event.page;
        this.itemsPerPage = event.itemsPerPage;
        this.atualizarPagina();
    }

    onItemsPerPageChange(value: number): void {
        this.itemsPerPage = Number(value);
        this.page = 1;
        this.atualizarPagina();
    }

    getStatusLabel(status?: string): string {
        const normalized = (status || '').trim().toUpperCase();

        if (['RESERVED', 'RESERVADO'].includes(normalized)) return 'Reservado';
        if (['SELL', 'SOLD', 'VENDIDO', 'APPROVED', 'APROVADO'].includes(normalized)) return 'Vendido';
        if (['OPEN', 'DISPONIVEL', 'DISPONÍVEL'].includes(normalized)) return 'Disponivel';
        if (['FAILED', 'CANCELADO', 'CANCELED'].includes(normalized)) return 'Cancelado';
        if (['WAITING', 'PENDENTE'].includes(normalized)) return 'Pendente';

        return status || '-';
    }

    getStatusClass(status?: string): string {
        const normalized = (status || '').trim().toUpperCase();

        if (['RESERVED', 'RESERVADO'].includes(normalized)) return 'bg-warning text-dark';
        if (['SELL', 'SOLD', 'VENDIDO', 'APPROVED', 'APROVADO'].includes(normalized)) return 'bg-success';
        if (['OPEN', 'DISPONIVEL', 'DISPONÍVEL'].includes(normalized)) return 'bg-primary';
        if (['FAILED', 'CANCELADO', 'CANCELED'].includes(normalized)) return 'bg-secondary';
        if (['WAITING', 'PENDENTE'].includes(normalized)) return 'bg-info text-dark';

        return 'bg-secondary';
    }

    getStartIndex(): number {
        return this.totalItems === 0 ? 0 : ((this.page - 1) * this.itemsPerPage) + 1;
    }

    getEndIndex(): number {
        return Math.min(this.page * this.itemsPerPage, this.totalItems);
    }

    private atualizarPagina(): void {
        const start = (this.page - 1) * this.itemsPerPage;
        this.vendasPaginadas = this.vendasFiltradas.slice(start, start + this.itemsPerPage);
    }

    private toDateInput(date: Date): string {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
}