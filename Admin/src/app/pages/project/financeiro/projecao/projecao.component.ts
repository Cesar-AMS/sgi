import { Component } from '@angular/core';

type ProjectionRow = {
  month: string;
  receitaPrevista: number;
  despesaPrevista: number;
  resultadoPrevisto: number;
};

@Component({
  selector: 'app-projecao',
  templateUrl: './projecao.component.html',
  styleUrl: './projecao.component.scss',
})
export class ProjecaoComponent {
  rows: ProjectionRow[] = [
    { month: 'Abr/2026', receitaPrevista: 420000, despesaPrevista: 310000, resultadoPrevisto: 110000 },
    { month: 'Mai/2026', receitaPrevista: 445000, despesaPrevista: 322000, resultadoPrevisto: 123000 },
    { month: 'Jun/2026', receitaPrevista: 468000, despesaPrevista: 336000, resultadoPrevisto: 132000 },
  ];

  get resultadoTotal(): number {
    return this.rows.reduce((total, row) => total + row.resultadoPrevisto, 0);
  }
}
