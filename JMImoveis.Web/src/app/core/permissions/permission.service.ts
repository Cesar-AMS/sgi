import { Injectable } from '@angular/core';
import { MenuItem } from 'src/app/layouts/sidebar/menu.model';
import {
  AppProfile,
  CurrentUserPermissionState,
  ProfilePermissionMap,
} from './permission.models';
import { SessionService } from '../session/session.service';

const PROFILE_PERMISSIONS: Record<AppProfile, ProfilePermissionMap> = {
  Recepcao: {
    permissions: [
      'dashboard.executive.view',
      'reception.visits-agenda.view',
      'reception.visits-register.view',
      'reception.visits-register.create',
      'reception.visits-register.edit',
      'reception.visits-register.alterar_status',
      'reception.visits-reports.view',
      'reception.visits-reports.exportar',
      'customers.customers.view',
      'customers.customers.create',
      'customers.customers.edit',
    ],
  },
  AgenteAtendimento: {
    permissions: [
      'dashboard.executive.view',
      'commercial.proposals.view',
      'commercial.proposals.create',
      'commercial.proposals.edit',
      'commercial.sales-mirror.view',
      'customers.customers.view',
      'customers.customers.create',
      'customers.customers.edit',
    ],
  },
  Coordenador: {
    permissions: [
      'dashboard.executive.view',
      'commercial.leads.view',
      'commercial.leads.create',
      'commercial.leads.edit',
      'commercial.leads.alterar_status',
      'commercial.overview.view',
      'commercial.proposals.view',
      'commercial.proposals.create',
      'commercial.proposals.edit',
      'commercial.proposals.aprovar',
      'commercial.sales.view',
      'commercial.sales.create',
      'commercial.sales.edit',
      'commercial.sales.aprovar',
      'commercial.sales-mirror.view',
      'commercial.sales-mirror.bloquear',
      'commercial.sales-mirror.liberar',
      'commercial.sales-mirror.edit',
      'commercial.sales-mirror.alterar_status',
      'enterprises.builders.view',
      'enterprises.builders.create',
      'enterprises.builders.edit',
      'enterprises.projects.view',
      'enterprises.projects.create',
      'enterprises.projects.edit',
      'enterprises.units.view',
      'enterprises.units.create',
      'enterprises.units.edit',
      'customers.customers.view',
      'customers.customers.create',
      'customers.customers.edit',
      'customers.customers.excluir',
    ],
  },
  Gerente: {
    permissions: [
      'dashboard.executive.view',
      'commercial.leads.view',
      'commercial.leads.create',
      'commercial.leads.edit',
      'commercial.leads.excluir',
      'commercial.leads.exportar',
      'commercial.leads.alterar_status',
      'commercial.overview.view',
      'commercial.proposals.view',
      'commercial.proposals.create',
      'commercial.proposals.edit',
      'commercial.proposals.excluir',
      'commercial.proposals.aprovar',
      'commercial.proposals.exportar',
      'commercial.sales.view',
      'commercial.sales.create',
      'commercial.sales.edit',
      'commercial.sales.excluir',
      'commercial.sales.aprovar',
      'commercial.sales.exportar',
      'commercial.sales-mirror.view',
      'commercial.sales-mirror.bloquear',
      'commercial.sales-mirror.liberar',
      'commercial.sales-mirror.edit',
      'commercial.sales-mirror.alterar_status',
      'enterprises.builders.view',
      'enterprises.builders.create',
      'enterprises.builders.edit',
      'enterprises.builders.excluir',
      'enterprises.projects.view',
      'enterprises.projects.create',
      'enterprises.projects.edit',
      'enterprises.projects.excluir',
      'enterprises.units.view',
      'enterprises.units.create',
      'enterprises.units.edit',
      'enterprises.units.excluir',
      'customers.customers.view',
      'customers.customers.create',
      'customers.customers.edit',
      'customers.customers.excluir',
      'customers.customers.exportar',
    ],
  },
  GestorComercial: {
    permissions: [
      'dashboard.executive.view',
      'commercial.leads.view',
      'commercial.leads.create',
      'commercial.leads.edit',
      'commercial.leads.excluir',
      'commercial.leads.exportar',
      'commercial.leads.alterar_status',
      'commercial.overview.view',
      'commercial.proposals.view',
      'commercial.proposals.create',
      'commercial.proposals.edit',
      'commercial.proposals.aprovar',
      'commercial.sales.view',
      'commercial.sales.create',
      'commercial.sales.edit',
      'commercial.sales.aprovar',
      'commercial.sales.exportar',
      'customers.customers.view',
      'customers.customers.create',
      'customers.customers.edit',
      'marketing.campaigns.view',
      'marketing.reports.view',
    ],
  },
  Financeiro: {
    permissions: [
      'dashboard.executive.view',
      'finance.purchases.view',
      'finance.purchases.create',
      'finance.purchases.edit',
      'finance.purchases.excluir',
      'finance.purchases.exportar',
      'finance.accounts-payable.view',
      'finance.accounts-payable.create',
      'finance.accounts-payable.edit',
      'finance.accounts-payable.excluir',
      'finance.accounts-payable.aprovar',
      'finance.accounts-payable.exportar',
      'finance.accounts-payable.alterar_status',
      'finance.accounts-receivable.view',
      'finance.accounts-receivable.create',
      'finance.accounts-receivable.edit',
      'finance.accounts-receivable.excluir',
      'finance.accounts-receivable.aprovar',
      'finance.accounts-receivable.exportar',
      'finance.accounts-receivable.alterar_status',
      'finance.reports.view',
      'finance.reports.exportar',
      'finance.cash-flow.view',
      'finance.projection.view',
      'commercial.proposals.view',
      'commercial.sales.view',
    ],
  },
  RH: {
    permissions: [
      'dashboard.executive.view',
      'hr.staff-control.view',
      'hr.staff-control.create',
      'hr.staff-control.edit',
      'hr.staff-control.excluir',
      'hr.staff-control.exportar',
      'hr.absences.view',
      'hr.absences.create',
      'hr.absences.edit',
      'hr.absences.aprovar',
      'hr.payroll.view',
      'hr.payroll.create',
      'hr.payroll.edit',
      'hr.payroll.exportar',
      'hr.vacations.view',
      'hr.vacations.create',
      'hr.vacations.edit',
      'hr.vacations.aprovar',
      'hr.uniforms.view',
      'hr.uniforms.create',
      'hr.uniforms.edit',
      'hr.employees.view',
      'hr.employees.create',
      'hr.employees.edit',
      'hr.employees.excluir',
      'hr.employees.exportar',
      'hr.roles.view',
      'hr.roles.create',
      'hr.roles.edit',
      'hr.roles.excluir',
    ],
  },
  Marketing: {
    permissions: [
      'dashboard.executive.view',
      'marketing.campaigns.view',
      'marketing.campaigns.create',
      'marketing.campaigns.edit',
      'marketing.campaigns.excluir',
      'marketing.campaigns.exportar',
      'marketing.lead-sources.view',
      'marketing.lead-sources.create',
      'marketing.lead-sources.edit',
      'marketing.lead-sources.excluir',
      'marketing.reports.view',
      'marketing.reports.exportar',
      'commercial.leads.view',
      'commercial.overview.view',
    ],
  },
  Diretor: {
    permissions: ['*'],
  },
};

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private sessionService: SessionService) {}

  getCurrentProfile(): AppProfile | null {
    const user = this.sessionService.getCurrentUser() as any;
    const rawProfile =
      user?.profile ??
      user?.perfil ??
      user?.role ??
      user?.cargo ??
      user?.jobTitle ??
      null;

    if (!rawProfile || typeof rawProfile !== 'string') {
      return null;
    }

    const normalized = rawProfile
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();

    switch (normalized) {
      case 'recepcao':
        return 'Recepcao';
      case 'agenteatendimento':
      case 'agente':
        return 'AgenteAtendimento';
      case 'coordenador':
        return 'Coordenador';
      case 'gerente':
        return 'Gerente';
      case 'gestorcomercial':
        return 'GestorComercial';
      case 'financeiro':
        return 'Financeiro';
      case 'rh':
        return 'RH';
      case 'marketing':
        return 'Marketing';
      case 'diretor':
      case 'admin':
      case 'administrador':
        return 'Diretor';
      default:
        return null;
    }
  }

  getCurrentPermissionState(): CurrentUserPermissionState {
    const user = this.sessionService.getCurrentUser() as any;
    const profile = this.getCurrentProfile();
    const directPermissions = this.normalizePermissions(user?.permissions);

    if (directPermissions.length > 0) {
      return {
        profile,
        permissions: directPermissions,
      };
    }

    return {
      profile,
      permissions: profile ? [...(PROFILE_PERMISSIONS[profile]?.permissions ?? [])] : [],
    };
  }

  getCurrentPermissions(): string[] {
    return this.getCurrentPermissionState().permissions;
  }

  hasPermission(permissionKey?: string | null): boolean {
    if (!permissionKey) {
      return true;
    }

    const permissions = this.getCurrentPermissions();
    if (!permissions.length) {
      return true;
    }

    return permissions.includes('*') || permissions.includes(permissionKey);
  }

  hasAnyPermission(permissionKeys?: string[] | null): boolean {
    if (!permissionKeys || !permissionKeys.length) {
      return true;
    }

    return permissionKeys.some((permissionKey) => this.hasPermission(permissionKey));
  }

  filterSidebarMenu(items: MenuItem[]): MenuItem[] {
    return this.filterRecursive(items);
  }

  private filterRecursive(items: MenuItem[]): MenuItem[] {
    return items
      .map((item) => {
        const filteredSubItems = Array.isArray(item.subItems)
          ? this.filterRecursive(item.subItems)
          : undefined;

        if (item.isTitle) {
          return item;
        }

        const itemPermissions = this.resolveItemPermissions(item);
        const hasAccess = item.alwaysVisible || this.hasAnyPermission(itemPermissions);

        if (hasAccess || (filteredSubItems && filteredSubItems.length > 0)) {
          return {
            ...item,
            subItems: filteredSubItems,
          };
        }

        return null;
      })
      .filter((item): item is MenuItem => item !== null);
  }

  private resolveItemPermissions(item: MenuItem): string[] {
    const permissionKeys = Array.isArray(item.permissionKeys) ? item.permissionKeys : [];
    if (permissionKeys.length > 0) {
      return permissionKeys;
    }

    if (item.permissionKey) {
      return [item.permissionKey];
    }

    return [];
  }

  private normalizePermissions(rawPermissions: unknown): string[] {
    if (!Array.isArray(rawPermissions)) {
      return [];
    }

    return rawPermissions.filter(
      (permission): permission is string => typeof permission === 'string'
    );
  }
}
