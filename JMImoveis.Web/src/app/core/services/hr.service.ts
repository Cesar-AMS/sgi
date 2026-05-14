import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { Cargos, Usuarios } from 'src/app/models/ContaBancaria';
import { AdminAccessService } from './admin-access.service';

export type EmployeeControlRow = {
  id: number;
  name: string;
  email: string;
  cargo: string;
  managerId?: number | null;
  coordenatorId?: number | null;
  gestorId?: number | null;
  gerente: string;
  coordenador: string;
  status: string;
  employmentType: string;
  employmentTypeLabel: string;
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
  constructor(private adminAccessService: AdminAccessService) {}

  getEmployeeControl(): Observable<EmployeeControlRow[]> {
    return forkJoin({
      users: this.adminAccessService.listUsersByStatus('all'),
      roles: this.adminAccessService.listRoles(),
    }).pipe(
      map(({ users, roles }) => this.mapUsersToEmployeeRows(users, roles))
    );
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

  private mapUsersToEmployeeRows(users: Usuarios[], roles: Cargos[]): EmployeeControlRow[] {
    const usersById = new Map<number, Usuarios>(
      (users ?? []).filter((user) => !!user?.id).map((user) => [user.id, user])
    );

    const rolesById = new Map<number, string>(
      (roles ?? []).filter((role) => !!role?.id).map((role) => [role.id, role.name])
    );

    return (users ?? []).map((user) => ({
      id: user.id,
      name: user.name || '-',
      email: user.email || '-',
      cargo: this.resolveUserRole(user, rolesById),
      managerId: user.managerId,
      coordenatorId: user.coordenatorId,
      gestorId: user.gestorId,
      gerente: this.resolveUserName(user.managerName, usersById, user.managerId),
      coordenador: this.resolveUserName(user.coordenatorName, usersById, user.coordenatorId),
      status: user.hidden ? 'Inativo' : 'Ativo',
      employmentType: this.normalizeEmploymentType(user.employmentType),
      employmentTypeLabel: this.getEmploymentTypeLabel(user.employmentType),
      branch: user.filial ? `Filial ${user.filial}` : '-',
    }));
  }

  private resolveUserName(
    enrichedName: string | undefined,
    usersById: Map<number, Usuarios>,
    userId?: number | null
  ): string {
    if (enrichedName?.trim()) {
      return enrichedName;
    }

    if (!userId) {
      return '-';
    }

    return usersById.get(userId)?.name || '-';
  }

  private resolveUserRole(user: Usuarios, rolesById: Map<number, string>): string {
    if (user.roleName?.trim()) {
      const roleNames = this.distinctRoleNames(user.roleName.split(','));
      if (roleNames.length) {
        return roleNames.join(', ');
      }
    }

    if (user.roleNames?.length) {
      const roleNames = this.distinctRoleNames(user.roleNames);
      if (roleNames.length) {
        return roleNames.join(', ');
      }
    }

    const roleIds = Array.isArray(user.jobpositionId)
      ? user.jobpositionId
      : user.jobpositionId
        ? [user.jobpositionId]
        : [];

    const roleNames = roleIds
      .map((roleId) => rolesById.get(Number(roleId)))
      .filter((roleName): roleName is string => !!roleName);

    const distinctRoleNames = this.distinctRoleNames(roleNames);
    return distinctRoleNames.length ? distinctRoleNames.join(', ') : '-';
  }

  private distinctRoleNames(roleNames: Array<string | undefined | null>): string[] {
    const normalized = roleNames
      .map((roleName) => roleName?.trim())
      .filter((roleName): roleName is string => !!roleName);

    return Array.from(new Map(
      normalized.map((roleName) => [roleName.toLocaleLowerCase('pt-BR'), roleName])
    ).values());
  }

  private normalizeEmploymentType(employmentType?: string | null): string {
    const normalized = employmentType?.trim().toUpperCase();
    if (!normalized) {
      return 'FUNCIONARIO';
    }

    return ['FUNCIONARIO', 'PJ', 'PARCEIRO', 'TERCEIRO', 'CONTADOR', 'DIRETOR', 'OUTRO'].includes(normalized)
      ? normalized
      : 'OUTRO';
  }

  private getEmploymentTypeLabel(employmentType?: string | null): string {
    const labels: Record<string, string> = {
      FUNCIONARIO: 'Funcionário',
      PJ: 'Pessoa Jurídica',
      PARCEIRO: 'Parceiro',
      TERCEIRO: 'Terceiro',
      CONTADOR: 'Contador',
      DIRETOR: 'Diretor',
      OUTRO: 'Outro',
    };

    return labels[this.normalizeEmploymentType(employmentType)] || 'Funcionário';
  }
}
