import { Component } from '@angular/core';

type CashFlowRow = {
  period: string;
  entradas: number;
  saidas: number;
  saldo: number;
};

@Component({
  selector: 'app-fluxo-caixa',
  templateUrl: './fluxo-caixa.component.html',
  styleUrl: './fluxo-caixa.component.scss',
})
export class FluxoCaixaComponent {
  rows: CashFlowRow[] = [
    { period: 'Semana 1', entradas: 185000, saidas: 74200, saldo: 110800 },
    { period: 'Semana 2', entradas: 164500, saidas: 81800, saldo: 82700 },
    { period: 'Semana 3', entradas: 197000, saidas: 90300, saldo: 106700 },
    { period: 'Semana 4', entradas: 142000, saidas: 69500, saldo: 72500 },
  ];

  get totalEntradas(): number {
    return this.rows.reduce((total, row) => total + row.entradas, 0);
  }

  get totalSaidas(): number {
    return this.rows.reduce((total, row) => total + row.saidas, 0);
  }

  get saldoProjetado(): number {
    return this.rows.reduce((total, row) => total + row.saldo, 0);
  }
}
