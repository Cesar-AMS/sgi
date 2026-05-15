import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AdminAccessService } from 'src/app/core/services/admin-access.service';
import { EmployeeControlRow, HrService } from 'src/app/core/services/hr.service';
import {
  Permission,
  PermissionsService,
  UserPermissionOverride
} from 'src/app/core/services/permissions.service';
import { Cargos } from 'src/app/models/ContaBancaria';

type PermissionGroup = {
  module: string;
  permissions: Permission[];
};

type OverrideEffect = 'DEFAULT' | 'ALLOW' | 'DENY';

@Component({
  selector: 'app-perfis-acessos',
  templateUrl: './perfis-acessos.component.html',
  styleUrls: ['./perfis-acessos.component.scss'],
})
export class PerfisAcessosComponent implements OnInit {
  roles: Cargos[] = [];
  collaborators: EmployeeControlRow[] = [];
  filteredCollaborators: EmployeeControlRow[] = [];

  permissions: Permission[] = [];
  permissionGroups: PermissionGroup[] = [];

  selectedRole?: Cargos;
  selectedCollaborator?: EmployeeControlRow;

  selectedRolePermissionIds = new Set<number>();
  effectivePermissionIds = new Set<number>();
  userOverrideEffects = new Map<number, OverrideEffect>();

  searchTerm = '';

  loadingInitialData = false;
  loadingRolePermissions = false;
  loadingUserPermissions = false;
  savingRolePermissions = false;
  savingUserOverrides = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private hrService: HrService,
    private adminAccessService: AdminAccessService,
    private permissionsService: PermissionsService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loadingInitialData = true;
    this.successMessage = '';
    this.errorMessage = '';

    forkJoin({
      collaborators: this.hrService.getEmployeeControl(),
      roles: this.adminAccessService.listRoles(),
      permissions: this.permissionsService.getPermissions(),
    }).subscribe({
      next: ({ collaborators, roles, permissions }) => {
        this.collaborators = collaborators ?? [];
        this.roles = (roles ?? [])
          .filter((role) => role?.id)
          .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
        this.permissions = permissions ?? [];
        this.permissionGroups = this.groupPermissionsByModule(this.permissions);
        this.resetOverrideEffects();
        this.applySearch();
        this.loadingInitialData = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados de Perfis e Acessos', err);
        this.errorMessage = 'Nao foi possivel carregar os dados de Perfis e Acessos.';
        this.loadingInitialData = false;
      },
    });
  }

  applySearch(): void {
    const term = this.normalizeSearch(this.searchTerm);

    if (!term) {
      this.filteredCollaborators = [...this.collaborators];
      return;
    }

    this.filteredCollaborators = this.collaborators.filter((collaborator) => {
      const haystack = [
        collaborator.name,
        collaborator.email,
        collaborator.cargo,
        collaborator.employmentTypeLabel,
        collaborator.status,
      ].map((value) => this.normalizeSearch(value)).join(' ');

      return haystack.includes(term);
    });
  }

  selectRole(role: Cargos): void {
    this.selectedRole = role;
    this.selectedRolePermissionIds = new Set<number>();
    this.successMessage = '';
    this.errorMessage = '';
    this.loadRolePermissions(role.id);
  }

  selectCollaborator(collaborator: EmployeeControlRow): void {
    if (!collaborator?.id) {
      this.errorMessage = 'Colaborador sem ID valido. Nao foi possivel carregar permissoes.';
      return;
    }

    this.selectedCollaborator = collaborator;
    this.effectivePermissionIds = new Set<number>();
    this.resetOverrideEffects();
    this.successMessage = '';
    this.errorMessage = '';
    this.loadUserPermissions(collaborator.id);
  }

  clearRoleSelection(): void {
    this.selectedRole = undefined;
    this.selectedRolePermissionIds = new Set<number>();
    this.successMessage = '';
    this.errorMessage = '';
    this.loadingRolePermissions = false;
    this.savingRolePermissions = false;
  }

  clearUserSelection(): void {
    this.selectedCollaborator = undefined;
    this.effectivePermissionIds = new Set<number>();
    this.resetOverrideEffects();
    this.successMessage = '';
    this.errorMessage = '';
    this.loadingUserPermissions = false;
    this.savingUserOverrides = false;
  }

  toggleRolePermission(permission: Permission, checked: boolean): void {
    const permissionId = Number(permission.id);

    if (!permissionId) {
      return;
    }

    if (checked) {
      this.selectedRolePermissionIds.add(permissionId);
    } else {
      this.selectedRolePermissionIds.delete(permissionId);
    }
  }

  isRolePermissionChecked(permission: Permission): boolean {
    return this.selectedRolePermissionIds.has(Number(permission.id));
  }

  setAllRolePermissions(checked: boolean): void {
    if (checked) {
      this.selectedRolePermissionIds = new Set(this.permissions.map((permission) => Number(permission.id)));
    } else {
      this.selectedRolePermissionIds = new Set<number>();
    }

    this.successMessage = '';
    this.errorMessage = '';
  }

  saveRolePermissions(): void {
    if (!this.selectedRole) {
      this.errorMessage = 'Selecione um perfil/cargo antes de salvar.';
      return;
    }

    const permissionIds = Array.from(this.selectedRolePermissionIds);

    this.savingRolePermissions = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.permissionsService.updateRolePermissions(this.selectedRole.id, permissionIds).subscribe({
      next: () => {
        this.savingRolePermissions = false;
        this.successMessage = 'Permissoes do perfil/cargo salvas com sucesso.';
        this.loadRolePermissions(this.selectedRole!.id, false);
      },
      error: (err) => {
        console.error('Erro ao salvar permissoes do perfil/cargo', err);
        this.errorMessage = 'Nao foi possivel salvar as permissoes do perfil/cargo.';
        this.savingRolePermissions = false;
      },
    });
  }

  setOverrideEffect(permission: Permission, effect: OverrideEffect): void {
    const permissionId = Number(permission.id);

    if (!permissionId) {
      return;
    }

    this.userOverrideEffects.set(permissionId, effect);
    this.successMessage = '';
    this.errorMessage = '';
  }

  getOverrideEffect(permission: Permission): OverrideEffect {
    return this.userOverrideEffects.get(Number(permission.id)) ?? 'DEFAULT';
  }

  isEffectivePermission(permission: Permission): boolean {
    return this.effectivePermissionIds.has(Number(permission.id));
  }

  saveUserOverrides(): void {
    if (!this.selectedCollaborator) {
      this.errorMessage = 'Selecione um colaborador antes de salvar excecoes.';
      return;
    }

    const overrides: UserPermissionOverride[] = Array.from(this.userOverrideEffects.entries())
      .filter(([, effect]) => effect === 'ALLOW' || effect === 'DENY')
      .map(([permissionId, effect]) => ({
        permissionId,
        effect: effect as 'ALLOW' | 'DENY',
      }));

    this.savingUserOverrides = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.permissionsService.updateUserOverrides(this.selectedCollaborator.id, overrides).subscribe({
      next: () => {
        this.savingUserOverrides = false;
        this.successMessage = 'Excecoes do colaborador salvas com sucesso.';
        this.loadUserPermissions(this.selectedCollaborator!.id, false);
      },
      error: (err) => {
        console.error('Erro ao salvar excecoes do colaborador', err);
        this.errorMessage = 'Nao foi possivel salvar as excecoes do colaborador.';
        this.savingUserOverrides = false;
      },
    });
  }

  trackRole(_: number, role: Cargos): number {
    return role.id;
  }

  trackCollaborator(_: number, collaborator: EmployeeControlRow): number {
    return collaborator.id;
  }

  trackGroup(_: number, group: PermissionGroup): string {
    return group.module;
  }

  trackPermission(_: number, permission: Permission): number {
    return permission.id;
  }

  getPermissionKey(permission: Permission): string {
    return permission.permissionKey ?? permission.permission_key ?? '';
  }

  get selectedRolePermissionCount(): number {
    return this.selectedRolePermissionIds.size;
  }

  get effectivePermissionCount(): number {
    return this.effectivePermissionIds.size;
  }

  get overrideCount(): number {
    return Array.from(this.userOverrideEffects.values())
      .filter((effect) => effect === 'ALLOW' || effect === 'DENY')
      .length;
  }

  private loadRolePermissions(roleId: number, showLoading = true): void {
    if (showLoading) {
      this.loadingRolePermissions = true;
    }

    this.permissionsService.getRolePermissions(roleId).subscribe({
      next: (rolePermissions) => {
        this.selectedRolePermissionIds = new Set(
          (rolePermissions ?? []).map((permission) => Number(permission.id))
        );
        this.loadingRolePermissions = false;
      },
      error: (err) => {
        console.error('Erro ao carregar permissoes do perfil/cargo', err);
        this.errorMessage = 'Nao foi possivel carregar as permissoes deste perfil/cargo.';
        this.loadingRolePermissions = false;
      },
    });
  }

  private loadUserPermissions(userId: number, showLoading = true): void {
    if (showLoading) {
      this.loadingUserPermissions = true;
    }

    forkJoin({
      overrides: this.permissionsService.getUserOverrides(userId),
      effective: this.permissionsService.getUserEffectivePermissions(userId),
    }).subscribe({
      next: ({ overrides, effective }) => {
        this.resetOverrideEffects();

        for (const override of overrides ?? []) {
          const permissionId = Number(override.permissionId ?? override.permission_id);
          if (permissionId && (override.effect === 'ALLOW' || override.effect === 'DENY')) {
            this.userOverrideEffects.set(permissionId, override.effect);
          }
        }

        this.effectivePermissionIds = new Set(
          (effective ?? []).map((permission) => Number(permission.id))
        );

        this.loadingUserPermissions = false;
      },
      error: (err) => {
        console.error('Erro ao carregar permissoes efetivas/excecoes do colaborador', err);
        this.errorMessage = 'Nao foi possivel carregar as permissoes deste colaborador.';
        this.loadingUserPermissions = false;
      },
    });
  }

  private resetOverrideEffects(): void {
    this.userOverrideEffects = new Map(
      this.permissions.map((permission) => [Number(permission.id), 'DEFAULT' as OverrideEffect])
    );
  }

  private groupPermissionsByModule(permissions: Permission[]): PermissionGroup[] {
    const groups = new Map<string, Permission[]>();

    for (const permission of permissions ?? []) {
      const moduleName = permission.module || 'Geral';

      if (!groups.has(moduleName)) {
        groups.set(moduleName, []);
      }

      groups.get(moduleName)!.push(permission);
    }

    return Array.from(groups.entries())
      .map(([module, modulePermissions]) => ({
        module,
        permissions: modulePermissions.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
      }))
      .sort((a, b) => a.module.localeCompare(b.module, 'pt-BR'));
  }

  private normalizeSearch(value?: string | null): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }
}
