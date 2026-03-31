import { Component, OnInit } from '@angular/core';
import { HrService, VacationRow } from 'src/app/core/services/hr.service';

@Component({
  selector: 'app-ferias',
  templateUrl: './ferias.component.html',
  styleUrl: './ferias.component.scss',
})
export class FeriasComponent implements OnInit {
  rows: VacationRow[] = [];

  constructor(private hrService: HrService) {}

  ngOnInit(): void {
    this.hrService.getVacations().subscribe((rows) => {
      this.rows = rows;
    });
  }
}
