import { Component, OnInit } from '@angular/core';
import { HrService, PayrollRow } from 'src/app/core/services/hr.service';

@Component({
  selector: 'app-folha-pagamentos',
  templateUrl: './folha-pagamentos.component.html',
  styleUrl: './folha-pagamentos.component.scss',
})
export class FolhaPagamentosComponent implements OnInit {
  rows: PayrollRow[] = [];

  constructor(private hrService: HrService) {}

  ngOnInit(): void {
    this.hrService.getPayroll().subscribe((rows) => {
      this.rows = rows;
    });
  }

  get totalFolha(): number {
    return this.rows.reduce((total, row) => total + row.total, 0);
  }
}
