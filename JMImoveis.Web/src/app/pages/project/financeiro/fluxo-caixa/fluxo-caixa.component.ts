import { Component, OnInit } from '@angular/core';
import { CashFlowGroupBy, CashFlowPeriod, CashFlowResponse, CashFlowSummary } from 'src/app/models/financial-cash-flow';
import { FinancialCashFlowService } from 'src/app/core/services/financial-cash-flow.service';

@Component({
  selector: 'app-fluxo-caixa',
  templateUrl: './fluxo-caixa.component.html',
  styleUrl: './fluxo-caixa.component.scss',
})
export class FluxoCaixaComponent implements OnInit {
  from = '';
  to = '';
  groupBy: CashFlowGroupBy = 'day';

  loading = false;
  errorMessage = '';
  response: CashFlowResponse | null = null;
  periods: CashFlowPeriod[] = [];

  readonly emptySummary: CashFlowSummary = {
    expectedInflow: 0,
    expectedOutflow: 0,
    expectedBalance: 0,
    realizedInflow: 0,
    realizedOutflow: 0,
    realizedBalance: 0,
    openInflow: 0,
    openOutflow: 0,
    projectionInflow: 0,
    projectionOutflow: 0,
    receivableCount: 0,
    payableCount: 0,
  };

  constructor(private cashFlowService: FinancialCashFlowService) {}

  ngOnInit(): void {
    this.setDefaultPeriod();
    this.loadCashFlow();
  }

  get summary(): CashFlowSummary {
    return this.response?.summary ?? this.emptySummary;
  }

  loadCashFlow(): void {
    if (!this.from || !this.to) {
      this.errorMessage = 'Informe a data inicial e a data final.';
      this.response = null;
      this.periods = [];
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.cashFlowService.getCashFlow({
      from: this.from,
      to: this.to,
      groupBy: this.groupBy,
    }).subscribe({
      next: (response) => {
        this.response = response;
        this.periods = response.periods ?? [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.error || 'Nao foi possivel carregar o fluxo de caixa.';
        this.response = null;
        this.periods = [];
        this.loading = false;
      },
    });
  }

  setFrom(value: string): void {
    this.from = value;
  }

  setTo(value: string): void {
    this.to = value;
  }

  setGroupBy(value: string): void {
    this.groupBy = value === 'month' ? 'month' : 'day';
  }

  formatPeriod(row: CashFlowPeriod): string {
    if (this.groupBy === 'month') {
      return row.period;
    }

    return this.formatDate(row.periodStart || row.period);
  }

  private setDefaultPeriod(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.from = this.toIsoDate(firstDay);
    this.to = this.toIsoDate(lastDay);
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('pt-BR');
  }
}
