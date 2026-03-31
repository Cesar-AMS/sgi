import { Component, OnInit } from '@angular/core';
import { AbsenceRow, HrService } from 'src/app/core/services/hr.service';

@Component({
  selector: 'app-controle-faltas',
  templateUrl: './controle-faltas.component.html',
  styleUrl: './controle-faltas.component.scss',
})
export class ControleFaltasComponent implements OnInit {
  rows: AbsenceRow[] = [];

  constructor(private hrService: HrService) {}

  ngOnInit(): void {
    this.hrService.getAbsences().subscribe((rows) => {
      this.rows = rows;
    });
  }
}
