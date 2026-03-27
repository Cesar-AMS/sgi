import { Component } from '@angular/core';

type UniformRow = {
  colaborador: string;
  kit: string;
  entrega: string;
  status: string;
};

@Component({
  selector: 'app-controle-uniforme',
  templateUrl: './controle-uniforme.component.html',
  styleUrl: './controle-uniforme.component.scss',
})
export class ControleUniformeComponent {
  rows: UniformRow[] = [
    { colaborador: 'Ana Souza', kit: 'Camisa + crachá', entrega: '12/03/2026', status: 'Entregue' },
    { colaborador: 'Carlos Lima', kit: 'Camisa + blazer', entrega: '18/03/2026', status: 'Pendente' },
    { colaborador: 'Juliana Rocha', kit: 'Camisa social', entrega: '08/03/2026', status: 'Ajuste solicitado' },
  ];
}
