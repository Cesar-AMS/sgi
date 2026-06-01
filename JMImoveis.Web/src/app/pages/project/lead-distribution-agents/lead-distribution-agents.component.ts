import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { LeadDistributionAgentService } from 'src/app/core/services/lead-distribution-agent.service';
import { Permission, PermissionsService } from 'src/app/core/services/permissions.service';
import { SessionService } from 'src/app/core/session/session.service';
import { Usuarios } from 'src/app/models/ContaBancaria';
import {
  CreateLeadDistributionAgentRequest,
  LeadDistributionAgent,
  LeadDistributionAgentLevel,
  UpdateLeadDistributionAgentRequest,
} from 'src/app/models/lead-distribution-agent';

@Component({
  selector: 'app-lead-distribution-agents',
  templateUrl: './lead-distribution-agents.component.html',
  styleUrls: ['./lead-distribution-agents.component.scss'],
})
export class LeadDistributionAgentsComponent implements OnInit {
  private readonly viewPermission = 'atendimento.gestao.distribuicao_leads.visualizar';
  private readonly editPermission = 'atendimento.gestao.distribuicao_leads.editar';
  private readonly adminPermission = 'sistema.admin.total';

  agents: LeadDistributionAgent[] = [];
  corretores: Usuarios[] = [];
  form!: FormGroup;

  canView = false;
  @Input()
  canEdit = false;
  isAccessDenied = false;
  isLoading = false;
  isLoadingUsers = false;
  isSaving = false;
  errorMessage = '';
  formErrorMessage = '';
  showModal = false;
  editingAgent: LeadDistributionAgent | null = null;

  levels: { value: LeadDistributionAgentLevel; label: string }[] = [
    { value: 'NOVATO', label: 'Novato' },
    { value: 'INTERMEDIARIO', label: 'Intermediario' },
    { value: 'EXPERIENTE', label: 'Experiente' },
  ];

  constructor(
    private fb: FormBuilder,
    private distributionAgentService: LeadDistributionAgentService,
    private permissionsService: PermissionsService,
    private sessionService: SessionService,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      userId: ['', Validators.required],
      isActive: [true],
      level: ['INTERMEDIARIO', Validators.required],
      priority: [100],
      maxDailyLeads: [null],
    });

    this.loadPermissions();
  }

  get totalConfigured(): number {
    return this.agents.length;
  }

  get activeCount(): number {
    return this.agents.filter((agent) => agent.isActive).length;
  }

  get experiencedCount(): number {
    return this.agents.filter((agent) => agent.level === 'EXPERIENTE').length;
  }

  get noviceCount(): number {
    return this.agents.filter((agent) => agent.level === 'NOVATO').length;
  }

  get availableCorretores(): Usuarios[] {
    if (this.editingAgent) {
      return this.corretores;
    }

    const configuredUserIds = new Set(this.agents.map((agent) => Number(agent.userId)));
    return this.corretores.filter((user) => !configuredUserIds.has(Number(user.id)));
  }

  loadPermissions(): void {
    const userId = this.sessionService.getCurrentUserId();

    if (!userId) {
      this.canView = false;
      this.canEdit = false;
      this.isAccessDenied = true;
      return;
    }

    this.permissionsService.getUserEffectivePermissions(userId).subscribe({
      next: (permissions) => {
        const permissionKeys = new Set(this.extractPermissionKeys(permissions));
        const isAdmin = permissionKeys.has(this.adminPermission);

        this.canEdit = isAdmin || permissionKeys.has(this.editPermission);
        this.canView = isAdmin || this.canEdit || permissionKeys.has(this.viewPermission);
        this.isAccessDenied = !this.canView;

        if (this.canView) {
          this.loadAgents();
          this.loadCorretores();
        }
      },
      error: () => {
        this.canView = false;
        this.canEdit = false;
        this.isAccessDenied = true;
      },
    });
  }

  loadAgents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.distributionAgentService.list().subscribe({
      next: (agents) => {
        this.agents = agents ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error, 'Nao foi possivel carregar os agentes da distribuicao.');
        this.isLoading = false;
      },
    });
  }

  loadCorretores(): void {
    this.isLoadingUsers = true;

    this.apiService.getCorretores().subscribe({
      next: (users) => {
        this.corretores = users ?? [];
        this.isLoadingUsers = false;
      },
      error: () => {
        this.corretores = [];
        this.isLoadingUsers = false;
      },
    });
  }

  openCreateModal(): void {
    if (!this.canEdit) {
      return;
    }

    this.editingAgent = null;
    this.formErrorMessage = '';
    this.form.get('userId')?.enable({ emitEvent: false });
    this.form.reset({
      userId: '',
      isActive: true,
      level: 'INTERMEDIARIO',
      priority: 100,
      maxDailyLeads: null,
    });
    this.showModal = true;
  }

  openEditModal(agent: LeadDistributionAgent): void {
    if (!this.canEdit) {
      return;
    }

    this.editingAgent = agent;
    this.formErrorMessage = '';
    this.form.reset({
      userId: agent.userId,
      isActive: agent.isActive,
      level: agent.level,
      priority: agent.priority ?? 100,
      maxDailyLeads: agent.maxDailyLeads ?? null,
    });
    this.form.get('userId')?.disable({ emitEvent: false });
    this.showModal = true;
  }

  closeModal(): void {
    if (this.isSaving) {
      return;
    }

    this.showModal = false;
    this.editingAgent = null;
    this.formErrorMessage = '';
    this.form.get('userId')?.enable({ emitEvent: false });
  }

  submit(): void {
    if (!this.canEdit) {
      return;
    }

    this.formErrorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formErrorMessage = 'Preencha os campos obrigatorios.';
      return;
    }

    const rawValue = this.form.getRawValue();
    const maxDailyLeads = this.normalizeOptionalNumber(rawValue.maxDailyLeads);

    if (maxDailyLeads !== null && maxDailyLeads < 0) {
      this.formErrorMessage = 'O limite diario nao pode ser negativo.';
      return;
    }

    const priorityValue = this.normalizeOptionalNumber(rawValue.priority);
    const priority = priorityValue && priorityValue > 0 ? priorityValue : 100;
    this.isSaving = true;

    if (this.editingAgent) {
      const payload: UpdateLeadDistributionAgentRequest = {
        isActive: Boolean(rawValue.isActive),
        level: rawValue.level,
        priority,
        maxDailyLeads,
      };

      this.distributionAgentService.update(this.editingAgent.id, payload).subscribe({
        next: () => this.handleSaveSuccess('Configuracao atualizada com sucesso.'),
        error: (error) => this.handleSaveError(error),
      });
      return;
    }

    const payload: CreateLeadDistributionAgentRequest = {
      userId: Number(rawValue.userId),
      isActive: Boolean(rawValue.isActive),
      level: rawValue.level,
      priority,
      maxDailyLeads,
    };

    this.distributionAgentService.create(payload).subscribe({
      next: () => this.handleSaveSuccess('Agente adicionado a distribuicao.'),
      error: (error) => this.handleSaveError(error),
    });
  }

  toggleAgent(agent: LeadDistributionAgent): void {
    if (!this.canEdit) {
      return;
    }

    this.distributionAgentService.toggle(agent.id, !agent.isActive).subscribe({
      next: () => {
        this.toastr.success(agent.isActive ? 'Agente inativado.' : 'Agente ativado.');
        this.loadAgents();
      },
      error: (error) => {
        this.toastr.error(this.getErrorMessage(error, 'Nao foi possivel alterar o status do agente.'));
      },
    });
  }

  removeAgent(agent: LeadDistributionAgent): void {
    if (!this.canEdit) {
      return;
    }

    const confirmed = window.confirm(
      'Tem certeza que deseja remover este agente da distribuicao? Isso nao remove o usuario do sistema.'
    );

    if (!confirmed) {
      return;
    }

    this.distributionAgentService.remove(agent.id).subscribe({
      next: () => {
        this.toastr.success('Agente removido da distribuicao.');
        this.loadAgents();
      },
      error: (error) => {
        this.toastr.error(this.getErrorMessage(error, 'Nao foi possivel remover o agente.'));
      },
    });
  }

  formatLevel(level: string | null | undefined): string {
    const option = this.levels.find((item) => item.value === level);
    return option?.label ?? '-';
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  trackByAgentId(_: number, agent: LeadDistributionAgent): number {
    return agent.id;
  }

  trackByUserId(_: number, user: Usuarios): number {
    return user.id;
  }

  hasSelectedUserInCorretores(): boolean {
    if (!this.editingAgent) {
      return true;
    }

    return this.corretores.some((user) => Number(user.id) === Number(this.editingAgent?.userId));
  }

  private handleSaveSuccess(message: string): void {
    this.toastr.success(message);
    this.isSaving = false;
    this.closeModal();
    this.loadAgents();
  }

  private handleSaveError(error: unknown): void {
    this.formErrorMessage = this.getErrorMessage(error, 'Nao foi possivel salvar a configuracao.');
    this.isSaving = false;
  }

  private normalizeOptionalNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private extractPermissionKeys(permissions: Permission[]): string[] {
    return (permissions ?? [])
      .map((permission) => permission.permissionKey ?? permission.permission_key ?? '')
      .filter((permissionKey) => permissionKey.length > 0);
  }

  private getErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.title || error?.message || fallback;
  }
}
