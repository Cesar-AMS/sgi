import { Component } from '@angular/core';

type PayrollRow = {
  colaborador: string;
  cargo: string;
  salarioBase: number;
  adicional: number;
  total: number;
};

@Component({
  selector: 'app-folha-pagamentos',
  templateUrl: './folha-pagamentos.component.html',
  styleUrl: './folha-pagamentos.component.scss',
})
export class FolhaPagamentosComponent {
  rows: PayrollRow[] = [
    { colaborador: 'Ana Souza', cargo: 'Recepção', salarioBase: 3200, adicional: 250, total: 3450 },
    { colaborador: 'Carlos Lima', cargo: 'Consultor', salarioBase: 4200, adicional: 800, total: 5000 },
    { colaborador: 'Juliana Rocha', cargo: 'Analista Financeiro', salarioBase: 5100, adicional: 400, total: 5500 },
  ];

  get totalFolha(): number {
    return this.rows.reduce((total, row) => total + row.total, 0);
  }
}
