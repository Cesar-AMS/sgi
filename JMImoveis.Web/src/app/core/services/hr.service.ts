import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type EmployeeControlRow = {
  name: string;
  area: string;
  status: string;
  branch: string;
};

export type PayrollRow = {
  colaborador: string;
  cargo: string;
  salarioBase: number;
  adicional: number;
  total: number;
};

export type AbsenceRow = {
  colaborador: string;
  data: string;
  motivo: string;
  status: string;
};

export type VacationRow = {
  colaborador: string;
  periodo: string;
  status: string;
};

export type UniformRow = {
  colaborador: string;
  kit: string;
  entrega: string;
  status: string;
};

@Injectable({ providedIn: 'root' })
export class HrService {
  getEmployeeControl(): Observable<EmployeeControlRow[]> {
    return of([
      { name: 'Ana Souza', area: 'Atendimento', status: 'Ativo', branch: 'Matriz' },
      { name: 'Carlos Lima', area: 'Vendas', status: 'Ativo', branch: 'Filial Norte' },
      { name: 'Juliana Rocha', area: 'Financeiro', status: 'Afastado', branch: 'Matriz' },
    ]);
  }

  getPayroll(): Observable<PayrollRow[]> {
    return of([
      { colaborador: 'Ana Souza', cargo: 'Recepcao', salarioBase: 3200, adicional: 250, total: 3450 },
      { colaborador: 'Carlos Lima', cargo: 'Consultor', salarioBase: 4200, adicional: 800, total: 5000 },
      { colaborador: 'Juliana Rocha', cargo: 'Analista Financeiro', salarioBase: 5100, adicional: 400, total: 5500 },
    ]);
  }

  getAbsences(): Observable<AbsenceRow[]> {
    return of([
      { colaborador: 'Ana Souza', data: '11/03/2026', motivo: 'Atestado', status: 'Justificada' },
      { colaborador: 'Carlos Lima', data: '15/03/2026', motivo: 'Ausencia sem aviso', status: 'Pendente' },
      { colaborador: 'Juliana Rocha', data: '19/03/2026', motivo: 'Consulta medica', status: 'Justificada' },
    ]);
  }

  getVacations(): Observable<VacationRow[]> {
    return of([
      { colaborador: 'Patricia Melo', periodo: '05/04/2026 a 20/04/2026', status: 'Programada' },
      { colaborador: 'Diego Santos', periodo: '10/05/2026 a 24/05/2026', status: 'Em aprovacao' },
      { colaborador: 'Fernanda Costa', periodo: '01/03/2026 a 15/03/2026', status: 'Concluida' },
    ]);
  }

  getUniforms(): Observable<UniformRow[]> {
    return of([
      { colaborador: 'Ana Souza', kit: 'Camisa + cracha', entrega: '12/03/2026', status: 'Entregue' },
      { colaborador: 'Carlos Lima', kit: 'Camisa + blazer', entrega: '18/03/2026', status: 'Pendente' },
      { colaborador: 'Juliana Rocha', kit: 'Camisa social', entrega: '08/03/2026', status: 'Ajuste solicitado' },
    ]);
  }
}
