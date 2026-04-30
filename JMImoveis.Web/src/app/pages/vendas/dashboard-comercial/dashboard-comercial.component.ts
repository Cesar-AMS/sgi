import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { SalesService } from 'src/app/core/services/sales.service';
import { ProposalsService } from 'src/app/core/services/proposals.service';
import { Sales } from 'src/app/models/ContaBancaria';
import { PropostaReserva } from 'src/app/models/proposta-reserva';

interface ChartItem {
    label: string;
    total: number;
    height: number;
}

@Component({
    selector: 'app-dashboard-comercial',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard-comercial.component.html',
    styleUrls: ['./dashboard-comercial.component.scss']
})
export class DashboardComercialComponent implements OnInit {
    carregando = false;
    vendas: Sales[] = [];
    propostasAnalise: PropostaReserva[] = [];
    chartItems: ChartItem[] = [];

    totalVendasMes = 0;
    totalPropostasAnalise = 0;
    valorTotalVendido = 0;
    ticketMedio = 0;

    readonly periodo = {
        inicio: this.toDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        fim: this.toDateInput(new Date())
    };

    constructor(
        private salesService: SalesService,
        private proposalsService: ProposalsService
    ) {}

    ngOnInit(): void {
        this.carregarDashboard();
    }

    carregarDashboard(): void {
        this.carregando = true;

        forkJoin({
            vendas: this.salesService.getOpportunityList({
                startAt: this.periodo.inicio,
                finishAt: this.periodo.fim,
                enterpriseId: 0,
                filialId: 0,
                clienteId: 0,
                status: 'ABC',
                managementId: 0
            }),
            propostas: this.proposalsService.list({ status: 'EM_ANALISE' })
        }).subscribe({
            next: ({ vendas, propostas }) => {
                this.vendas = vendas || [];
                this.propostasAnalise = propostas || [];
                this.calcularIndicadores();
                this.montarGrafico();
            },
            error: (error) => {
                console.error('Erro ao carregar dashboard comercial', error);
            },
            complete: () => {
                this.carregando = false;
            }
        });
    }

    private calcularIndicadores(): void {
        const vendasFechadas = this.vendas.filter(venda => this.isVendaFechada(venda.status));

        this.totalVendasMes = vendasFechadas.length;
        this.totalPropostasAnalise = this.propostasAnalise.length;
        this.valorTotalVendido = vendasFechadas.reduce((total, venda) => total + Number(venda.unitValue || 0), 0);
        this.ticketMedio = this.totalVendasMes > 0 ? this.valorTotalVendido / this.totalVendasMes : 0;
    }

    private montarGrafico(): void {
        const totaisPorDia = new Map<string, number>();

        this.vendas
            .filter(venda => this.isVendaFechada(venda.status))
            .forEach(venda => {
                const data = this.toDateInput(new Date(venda.selledAt || venda.createdAt));
                totaisPorDia.set(data, (totaisPorDia.get(data) || 0) + Number(venda.unitValue || 0));
            });

        const max = Math.max(...Array.from(totaisPorDia.values()), 1);

        this.chartItems = Array.from(totaisPorDia.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12)
            .map(([data, total]) => ({
                label: this.formatarDia(data),
                total,
                height: Math.max(12, Math.round((total / max) * 100))
            }));
    }

    private isVendaFechada(status?: string): boolean {
        const normalized = (status || '').trim().toUpperCase();
        return ['SELL', 'SOLD', 'VENDIDO', 'APPROVED', 'APROVADO'].includes(normalized);
    }

    private toDateInput(date: Date): string {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    private formatarDia(data: string): string {
        const [, mes, dia] = data.split('-');
        return `${dia}/${mes}`;
    }
}