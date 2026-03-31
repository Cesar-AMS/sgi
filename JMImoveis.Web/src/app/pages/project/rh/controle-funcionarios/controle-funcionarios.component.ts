import { Component, OnInit } from '@angular/core';
import { EmployeeControlRow, HrService } from 'src/app/core/services/hr.service';

@Component({
  selector: 'app-controle-funcionarios',
  templateUrl: './controle-funcionarios.component.html',
  styleUrl: './controle-funcionarios.component.scss',
})
export class ControleFuncionariosComponent implements OnInit {
  rows: EmployeeControlRow[] = [];

  constructor(private hrService: HrService) {}

  ngOnInit(): void {
    this.hrService.getEmployeeControl().subscribe((rows) => {
      this.rows = rows;
    });
  }
}
