import { Component, OnInit } from '@angular/core';
import { HrService, UniformRow } from 'src/app/core/services/hr.service';

@Component({
  selector: 'app-controle-uniforme',
  templateUrl: './controle-uniforme.component.html',
  styleUrl: './controle-uniforme.component.scss',
})
export class ControleUniformeComponent implements OnInit {
  rows: UniformRow[] = [];

  constructor(private hrService: HrService) {}

  ngOnInit(): void {
    this.hrService.getUniforms().subscribe((rows) => {
      this.rows = rows;
    });
  }
}
