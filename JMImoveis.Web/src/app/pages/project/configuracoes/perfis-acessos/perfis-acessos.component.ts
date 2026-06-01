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

type PermissionActionKey = 'visualizar' | 'editar' | 'outros';

type PermissionSubmoduleGroup = {
  label: string;
  searchText: string;
  permissions: Permission[];
  actions: {
    visualizar?: Permission;
    editar?: Permission;
    outros: Permission[];
  };
};

type PermissionModuleGroup = {
  module: string;
  searchText: string;
  submodules: PermissionSubmoduleGroup[];
};

type RoleGroup = {
  label: string;
  roles: Cargos[];
};

type OverrideEffect = 'DEFAULT' | 'ALLOW' | 'DENY';
type AccessTab = 'credentials' | 'permissions';

@Component({
  selector: 'app-perfis-acessos',
  templateUrl: './perfis-acessos.component.html',
  styleUrls: ['./perfis-acessos.component.scss'],
})
export class PerfisAcessosComponent implements OnInit {
  activeTab: AccessTab = 'permissions';
  roles: Cargos[] = [];
  collaborators: EmployeeControlRow[] = [];
  filteredCollaborators: EmployeeControlRow[] = [];

  permissions: Permission[] = [];
  permissionModuleGroups: PermissionModuleGroup[] = [];

  selectedRole?: Cargos;
  selectedCollaborator?: EmployeeControlRow;

  selectedRolePermissionIds = new Set<number>();
  rolePermissionCountById = new Map<number, number>();
  effectivePermissionIds = new Set<number>();
  userOverrideEffects = new Map<number, OverrideEffect>();

  searchTerm = '';
  roleSearchTerm = '';
  credentialsSearchTerm = '';
  permissionSearchTerm = '';

  loadingInitialData = false;
  loadingRolePermissions = false;
  loadingUserPermissions = false;
  savingRolePermissions = false;
  savingUserOverrides = false;
  updatingAccessIds = new Set<number>();
  savingPassword = false;

  successMessage = '';
  errorMessage = '';
  passwordErrorMessage = '';
  passwordCollaborator?: EmployeeControlRow;
  passwordForm = {
    newPassword: '',
    confirmPassword: '',
  };
  readonly minimumPasswordLength = 8;

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
          .sort((a, b) => this.normalizeSearch(a.name).localeCompare(this.normalizeSearch(b.name), 'pt-BR'));
        this.permissions = permissions ?? [];
        this.permissionModuleGroups = this.groupPermissions(this.permissions);
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

  trackGroup(_: number, group: PermissionModuleGroup): string {
    return group.module;
  }

  trackSubmodule(_: number, group: PermissionSubmoduleGroup): string {
    return group.label;
  }

  trackRoleGroup(_: number, group: RoleGroup): string {
    return group.label;
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

  get filteredPermissionModuleGroups(): PermissionModuleGroup[] {
    const term = this.normalizeSearch(this.permissionSearchTerm);

    if (!term) {
      return this.permissionModuleGroups;
    }

    return this.permissionModuleGroups
      .map((moduleGroup) => {
        const moduleMatches = this.normalizeSearch(moduleGroup.module).includes(term);
        const submodules = moduleGroup.submodules
          .map((submodule) => {
            const submoduleMatches = this.normalizeSearch(submodule.label).includes(term);
            const permissions = moduleMatches || submoduleMatches
              ? submodule.permissions
              : submodule.permissions.filter((permission) => this.permissionMatchesSearch(permission, term));

            return permissions.length
              ? this.buildPermissionSubmoduleGroup(submodule.label, permissions)
              : null;
          })
          .filter((submodule): submodule is PermissionSubmoduleGroup => !!submodule);

        return submodules.length
          ? this.buildPermissionModuleGroup(moduleGroup.module, submodules)
          : null;
      })
      .filter((moduleGroup): moduleGroup is PermissionModuleGroup => !!moduleGroup);
  }

  clearPermissionSearch(): void {
    this.permissionSearchTerm = '';
  }

  getPrimaryPermissions(group: PermissionSubmoduleGroup): Permission[] {
    return [group.actions.visualizar, group.actions.editar]
      .filter((permission): permission is Permission => !!permission);
  }

  getPermissionActionLabel(permission: Permission): string {
    const action = this.getPermissionAction(permission);

    if (action === 'visualizar') {
      return 'Visualizar';
    }

    if (action === 'editar') {
      return 'Editar';
    }

    return this.toDisplayLabel(permission.action || this.getPermissionKey(permission).split('.').pop() || permission.name);
  }

  get filteredRoles(): Cargos[] {
    const term = this.normalizeSearch(this.roleSearchTerm);

    if (!term) {
      return [...this.roles];
    }

    return this.roles.filter((role) => {
      const statusLabel = role.status ? 'Ativo' : 'Inativo';
      const haystack = [
        role.name,
        role.id?.toString(),
        statusLabel,
        this.getRoleGroupLabel(role),
      ].map((value) => this.normalizeSearch(value)).join(' ');

      return haystack.includes(term);
    });
  }

  get roleCounterLabel(): string {
    if (!this.normalizeSearch(this.roleSearchTerm)) {
      return `${this.roles.length} registro(s)`;
    }

    return `${this.filteredRoles.length} de ${this.roles.length} registro(s)`;
  }

  get groupedRoles(): RoleGroup[] {
    return this.buildRoleGroups(this.filteredRoles);
  }

  clearRoleSearch(): void {
    this.roleSearchTerm = '';
  }

  get filteredCredentialUsers(): EmployeeControlRow[] {
    const term = this.normalizeSearch(this.credentialsSearchTerm);

    if (!term) {
      return [...this.collaborators];
    }

    return this.collaborators.filter((collaborator) => {
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

  clearCredentialsSearch(): void {
    this.credentialsSearchTerm = '';
  }

  get effectivePermissionCount(): number {
    return this.effectivePermissionIds.size;
  }

  get overrideCount(): number {
    return Array.from(this.userOverrideEffects.values())
      .filter((effect) => effect === 'ALLOW' || effect === 'DENY')
      .length;
  }

  getRoleBadges(role: Cargos): string[] {
    const badges: string[] = [];
    const groupLabel = this.getRoleGroupLabel(role);

    if (groupLabel === 'Cargos oficiais') {
      badges.push('oficial');
    }

    if (groupLabel === 'Cargos antigos em uso') {
      badges.push('legado');
    }

    if (groupLabel === 'Cargos operacionais') {
      badges.push('operacional');
    }

    const permissionCount = this.rolePermissionCountById.get(Number(role.id));
    if (permissionCount === 0) {
      badges.push('sem permissoes');
    }

    return badges;
  }

  changeTab(tab: AccessTab): void {
    this.activeTab = tab;
  }

  getCredentialAccessStatus(collaborator: EmployeeControlRow): string {
    const accessEnabled = this.getCredentialAccessEnabled(collaborator);

    if (accessEnabled === true) {
      return 'Ativo';
    }

    if (accessEnabled === false) {
      return 'Bloqueado';
    }

    return 'Sem informacao';
  }

  getCredentialAccessEnabled(collaborator: EmployeeControlRow): boolean | null {
    if (typeof collaborator.accessEnabled === 'boolean') {
      return collaborator.accessEnabled;
    }

    return null;
  }

  isUpdatingAccess(collaborator: EmployeeControlRow): boolean {
    return this.updatingAccessIds.has(collaborator.id);
  }

  updateCredentialAccess(collaborator: EmployeeControlRow, accessEnabled: boolean): void {
    if (!collaborator?.id) {
      this.errorMessage = 'Usuario sem ID valido. Nao foi possivel alterar o acesso.';
      return;
    }

    if (this.getCredentialAccessEnabled(collaborator) === null) {
      this.errorMessage = 'Status de acesso indisponivel para este usuario.';
      return;
    }

    const action = accessEnabled ? 'reativar' : 'bloquear';
    const confirmed = window.confirm(`Deseja ${action} o acesso deste usuario?`);

    if (!confirmed) {
      return;
    }

    this.updatingAccessIds.add(collaborator.id);
    this.successMessage = '';
    this.errorMessage = '';

    this.adminAccessService.updateUserAccessEnabled(collaborator.id, accessEnabled).subscribe({
      next: () => {
        this.updateLocalCredentialAccess(collaborator.id, accessEnabled);
        this.updatingAccessIds.delete(collaborator.id);
        this.successMessage = accessEnabled
          ? 'Acesso reativado com sucesso.'
          : 'Acesso bloqueado com sucesso.';
      },
      error: (err) => {
        console.error('Erro ao alterar status de acesso do usuario', err);
        this.updatingAccessIds.delete(collaborator.id);
        this.errorMessage = this.resolveAccessUpdateErrorMessage(err);
      },
    });
  }

  openPasswordReset(collaborator: EmployeeControlRow): void {
    if (this.savingPassword) {
      return;
    }

    if (!collaborator?.id) {
      this.errorMessage = 'Usuario sem ID valido. Nao foi possivel redefinir a senha.';
      return;
    }

    this.passwordCollaborator = collaborator;
    this.passwordForm = {
      newPassword: '',
      confirmPassword: '',
    };
    this.passwordErrorMessage = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  closePasswordReset(): void {
    if (this.savingPassword) {
      return;
    }

    this.passwordCollaborator = undefined;
    this.passwordForm = {
      newPassword: '',
      confirmPassword: '',
    };
    this.passwordErrorMessage = '';
  }

  savePasswordReset(): void {
    if (!this.passwordCollaborator?.id) {
      this.passwordErrorMessage = 'Usuario sem ID valido. Nao foi possivel redefinir a senha.';
      return;
    }

    const newPassword = this.passwordForm.newPassword ?? '';
    const confirmPassword = this.passwordForm.confirmPassword ?? '';

    if (!newPassword.trim()) {
      this.passwordErrorMessage = 'Informe a nova senha.';
      return;
    }

    if (!confirmPassword.trim()) {
      this.passwordErrorMessage = 'Confirme a nova senha.';
      return;
    }

    if (newPassword !== confirmPassword) {
      this.passwordErrorMessage = 'A confirmacao da senha nao confere.';
      return;
    }

    if (newPassword.length < this.minimumPasswordLength) {
      this.passwordErrorMessage = `A senha deve ter pelo menos ${this.minimumPasswordLength} caracteres.`;
      return;
    }

    this.savingPassword = true;
    this.passwordErrorMessage = '';
    this.successMessage = '';
    this.errorMessage = '';

    this.adminAccessService.updateUserPassword(
      this.passwordCollaborator.id,
      newPassword,
      confirmPassword
    ).subscribe({
      next: () => {
        this.savingPassword = false;
        this.successMessage = 'Senha redefinida com sucesso.';
        this.closePasswordReset();
      },
      error: (err) => {
        console.error('Erro ao redefinir senha do usuario', err);
        this.savingPassword = false;
        this.passwordErrorMessage = this.resolvePasswordUpdateErrorMessage(err);
      },
    });
  }

  private updateLocalCredentialAccess(userId: number, accessEnabled: boolean): void {
    const updateRow = (row: EmployeeControlRow) => {
      if (row.id === userId) {
        row.accessEnabled = accessEnabled;
      }
    };

    this.collaborators.forEach(updateRow);
    this.filteredCollaborators.forEach(updateRow);

    if (this.selectedCollaborator?.id === userId) {
      this.selectedCollaborator.accessEnabled = accessEnabled;
    }
  }

  private resolveAccessUpdateErrorMessage(err: any): string {
    if (err?.status === 401) {
      return 'Usuario autenticado nao identificado para alterar acessos.';
    }

    if (err?.status === 403) {
      return 'Usuario sem permissao para alterar credenciais de acesso.';
    }

    if (err?.status === 404) {
      return 'Usuario nao encontrado para alterar acesso.';
    }

    return 'Nao foi possivel alterar o status de acesso.';
  }

  private resolvePasswordUpdateErrorMessage(err: any): string {
    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.status === 401) {
      return 'Usuario autenticado nao identificado para redefinir senha.';
    }

    if (err?.status === 403) {
      return 'Usuario sem permissao para redefinir senha.';
    }

    if (err?.status === 404) {
      return 'Usuario nao encontrado para redefinir senha.';
    }

    return 'Nao foi possivel redefinir a senha.';
  }

  private buildRoleGroups(roles: Cargos[]): RoleGroup[] {
    const groups: RoleGroup[] = [
      { label: 'Cargos oficiais', roles: [] },
      { label: 'Cargos operacionais', roles: [] },
      { label: 'Cargos antigos em uso', roles: [] },
      { label: 'Outros cargos', roles: [] },
    ];
    const byLabel = new Map(groups.map((group) => [group.label, group]));

    for (const role of roles ?? []) {
      byLabel.get(this.getRoleGroupLabel(role))?.roles.push(role);
    }

    return groups
      .map((group) => ({
        ...group,
        roles: [...group.roles].sort((a, b) => this.normalizeSearch(a.name).localeCompare(this.normalizeSearch(b.name), 'pt-BR')),
      }))
      .filter((group) => group.roles.length > 0);
  }

  private getRoleGroupLabel(role: Cargos): string {
    const name = this.normalizeSearch(role.name || '');

    if ([
      'servicos gerais',
      'limpeza',
      'limpeza - chefe',
      'recepcionista',
      'secretaria',
      'controle de visitas',
      'empreendimentos',
      'mudar - empreendimentos',
    ].includes(name)) {
      return 'Cargos operacionais';
    }

    if ([
      'diretor comercial',
      'corretor',
      'corretor parceiro',
      'atendente',
      'gerente',
      'coordenador',
      'gestor',
      'vendedor',
      'analista financeiro junior',
      'analista financeiro pleno',
      'analista financeiro senior',
      'diretor financeiro',
      'analista de rh junior',
      'analista de rh pleno',
      'analista de rh senior',
      'analista de ti junior',
      'analista de ti pleno',
      'analista de ti senior',
      'contas a pagar',
    ].includes(name)) {
      return 'Cargos antigos em uso';
    }

    if ([
      'cfo',
      'coordenador financeiro',
      'analista financeiro',
      'assistente financeiro',
      'contas a receber',
      'tesouraria',
      'controladoria / dre',
      'correspondente bancario',
      'coordenador de rh',
      'analista de rh',
      'assistente de rh',
      'departamento pessoal',
      'recrutamento e selecao',
      'coordenador de ti',
      'analista de sistemas',
      'analista de suporte',
      'infraestrutura / redes',
      'desenvolvedor / automacao',
      'coordenador de marketing',
      'analista de marketing',
      'social media',
      'designer / criativo',
      'trafego pago',
      'compras',
      'gestor comercial',
      'gerente comercial',
      'coordenador comercial',
      'agente lider',
      'agente',
    ].includes(name)) {
      return 'Cargos oficiais';
    }

    return 'Outros cargos';
  }

  private loadRolePermissions(roleId: number, showLoading = true): void {
    if (showLoading) {
      this.loadingRolePermissions = true;
    }

    this.permissionsService.getRolePermissions(roleId).subscribe({
      next: (rolePermissions) => {
        const permissionIds = (rolePermissions ?? []).map((permission) => Number(permission.id));
        this.selectedRolePermissionIds = new Set(permissionIds);
        this.rolePermissionCountById.set(Number(roleId), permissionIds.length);
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

  private groupPermissions(permissions: Permission[]): PermissionModuleGroup[] {
    const groups = new Map<string, Map<string, Permission[]>>();

    for (const permission of permissions ?? []) {
      const moduleName = this.getPermissionDisplayModule(permission);
      const submoduleName = this.getPermissionSubmodule(permission);

      if (!groups.has(moduleName)) {
        groups.set(moduleName, new Map<string, Permission[]>());
      }

      const submodules = groups.get(moduleName)!;
      if (!submodules.has(submoduleName)) {
        submodules.set(submoduleName, []);
      }

      submodules.get(submoduleName)!.push(permission);
    }

    return Array.from(groups.entries())
      .map(([module, submodules]) => this.buildPermissionModuleGroup(
        module,
        Array.from(submodules.entries())
          .map(([label, submodulePermissions]) => this.buildPermissionSubmoduleGroup(label, submodulePermissions))
          .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
      ))
      .sort((a, b) => a.module.localeCompare(b.module, 'pt-BR'));
  }

  private buildPermissionModuleGroup(
    module: string,
    submodules: PermissionSubmoduleGroup[]
  ): PermissionModuleGroup {
    return {
      module,
      submodules,
      searchText: this.normalizeSearch([
        module,
        ...submodules.map((submodule) => submodule.searchText),
      ].join(' ')),
    };
  }

  private buildPermissionSubmoduleGroup(
    label: string,
    permissions: Permission[]
  ): PermissionSubmoduleGroup {
    const sortedPermissions = [...permissions].sort((a, b) => {
      const actionOrder = { visualizar: 0, editar: 1, outros: 2 };
      const actionComparison = actionOrder[this.getPermissionAction(a)] - actionOrder[this.getPermissionAction(b)];

      return actionComparison || a.name.localeCompare(b.name, 'pt-BR');
    });
    const actions: PermissionSubmoduleGroup['actions'] = { outros: [] };

    for (const permission of sortedPermissions) {
      const action = this.getPermissionAction(permission);
      if (action === 'visualizar' && !actions.visualizar) {
        actions.visualizar = permission;
      } else if (action === 'editar' && !actions.editar) {
        actions.editar = permission;
      } else {
        actions.outros.push(permission);
      }
    }

    return {
      label,
      permissions: sortedPermissions,
      actions,
      searchText: this.normalizeSearch([
        label,
        ...sortedPermissions.flatMap((permission) => [
          permission.name,
          permission.description,
          this.getPermissionKey(permission),
          permission.action,
        ]),
      ].join(' ')),
    };
  }

  private getPermissionDisplayModule(permission: Permission): string {
    const permissionKey = this.getPermissionKey(permission);

    if (permissionKey.startsWith('atendimento.clientes.')) {
      return 'Comercial';
    }

    return permission.module || 'Geral';
  }

  private getPermissionSubmodule(permission: Permission): string {
    const permissionKey = this.getPermissionKey(permission);
    const knownSubmodules: Array<[string, string]> = [
      ['atendimento.gestao.distribuicao_leads.', 'Gestao > Distribuicao de Leads'],
      ['atendimento.gestao.regioes_interesse.', 'Gestao > Regioes de Interesse'],
      ['atendimento.gestao.fontes_origem.', 'Gestao > Fontes de Origem'],
      ['atendimento.gestao.', 'Gestao de Atendimento'],
      ['atendimento.leads.', 'Leads'],
      ['atendimento.posvisita.', 'Pos-Visita'],
      ['atendimento.agendamento.', 'Agendamento'],
      ['atendimento.visitas.', 'Visitas'],
      ['atendimento.relatorios.', 'Relatorios'],
      ['financeiro.contas_receber.', 'Contas a Receber'],
      ['financeiro.contas_pagar.', 'Contas a Pagar'],
      ['financeiro.fluxo_caixa.', 'Fluxo de Caixa'],
      ['financeiro.dre.', 'DRE'],
      ['financeiro.comissoes.', 'Comissoes'],
      ['vendas.propostas.', 'Propostas'],
      ['sistema.admin.total', 'Administracao Total'],
    ];
    const knownSubmodule = knownSubmodules.find(([prefix]) => permissionKey.startsWith(prefix));

    if (knownSubmodule) {
      return knownSubmodule[1];
    }

    const keyParts = permissionKey.split('.').filter(Boolean);
    const submoduleParts = keyParts.slice(1, -1);

    return submoduleParts.length
      ? submoduleParts.map((part) => this.toDisplayLabel(part)).join(' > ')
      : permission.name || 'Geral';
  }

  private getPermissionAction(permission: Permission): PermissionActionKey {
    const action = this.normalizeSearch(permission.action);
    const permissionKey = this.getPermissionKey(permission);

    if (action === 'visualizar' || permissionKey.endsWith('.visualizar')) {
      return 'visualizar';
    }

    if (action === 'editar' || permissionKey.endsWith('.editar')) {
      return 'editar';
    }

    return 'outros';
  }

  private permissionMatchesSearch(permission: Permission, term: string): boolean {
    return this.normalizeSearch([
      this.getPermissionDisplayModule(permission),
      this.getPermissionSubmodule(permission),
      permission.name,
      permission.description,
      this.getPermissionKey(permission),
      permission.action,
      this.getPermissionAction(permission),
    ].join(' ')).includes(term);
  }

  private toDisplayLabel(value: string): string {
    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (character) => character.toLocaleUpperCase('pt-BR'));
  }

  private normalizeSearch(value?: string | null): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }
}
