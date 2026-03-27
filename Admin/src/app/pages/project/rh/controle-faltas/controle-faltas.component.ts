import { Component } from '@angular/core';

type AbsenceRow = {
  colaborador: string;
  data: string;
  motivo: string;
  status: string;
};

@Component({
  selector: 'app-controle-faltas',
  templateUrl: './controle-faltas.component.html',
  styleUrl: './controle-faltas.component.scss',
})
export class ControleFaltasComponent {
  rows: AbsenceRow[] = [
    { colaborador: 'Ana Souza', data: '11/03/2026', motivo: 'Atestado', status: 'Justificada' },
    { colaborador: 'Carlos Lima', data: '15/03/2026', motivo: 'Ausência sem aviso', status: 'Pendente' },
    { colaborador: 'Juliana Rocha', data: '19/03/2026', motivo: 'Consulta médica', status: 'Justificada' },
  ];
}
