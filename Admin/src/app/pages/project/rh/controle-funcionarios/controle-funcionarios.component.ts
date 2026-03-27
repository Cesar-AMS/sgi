import { Component } from '@angular/core';

type EmployeeControlRow = {
  name: string;
  area: string;
  status: string;
  branch: string;
};

@Component({
  selector: 'app-controle-funcionarios',
  templateUrl: './controle-funcionarios.component.html',
  styleUrl: './controle-funcionarios.component.scss',
})
export class ControleFuncionariosComponent {
  rows: EmployeeControlRow[] = [
    { name: 'Ana Souza', area: 'Atendimento', status: 'Ativo', branch: 'Matriz' },
    { name: 'Carlos Lima', area: 'Vendas', status: 'Ativo', branch: 'Filial Norte' },
    { name: 'Juliana Rocha', area: 'Financeiro', status: 'Afastado', branch: 'Matriz' },
  ];
}
