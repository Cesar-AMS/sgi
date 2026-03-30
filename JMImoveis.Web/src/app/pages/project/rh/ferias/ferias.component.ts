import { Component } from '@angular/core';

type VacationRow = {
  colaborador: string;
  periodo: string;
  status: string;
};

@Component({
  selector: 'app-ferias',
  templateUrl: './ferias.component.html',
  styleUrl: './ferias.component.scss',
})
export class FeriasComponent {
  rows: VacationRow[] = [
    { colaborador: 'Patrícia Melo', periodo: '05/04/2026 a 20/04/2026', status: 'Programada' },
    { colaborador: 'Diego Santos', periodo: '10/05/2026 a 24/05/2026', status: 'Em aprovação' },
    { colaborador: 'Fernanda Costa', periodo: '01/03/2026 a 15/03/2026', status: 'Concluída' },
  ];
}
