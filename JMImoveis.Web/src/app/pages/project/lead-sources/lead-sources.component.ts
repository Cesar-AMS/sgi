import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LeadSourceService } from 'src/app/core/services/lead-source.service';
import { Permission, PermissionsService } from 'src/app/core/services/permissions.service';
import { SessionService } from 'src/app/core/session/session.service';
import {
  CreateLeadSourceRequest,
  LeadSource,
  UpdateLeadSourceRequest,
} from 'src/app/models/lead-source';

@Component({
  selector: 'app-lead-sources',
  templateUrl: './lead-sources.component.html',
  styleUrls: ['./lead-sources.component.scss'],
})
export class LeadSourcesComponent implements OnInit {
  private readonly viewPermission = 'atendimento.gestao.fontes_origem.visualizar';
  private readonly editPermission = 'atendimento.gestao.fontes_origem.editar';
  private readonly adminPermission = 'sistema.admin.total';

  sources: LeadSource[] = [];
  form!: FormGroup;

  canView = false;
  @Input()
  canEdit = false;
  isAccessDenied = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  formErrorMessage = '';
  showModal = false;
  editingSource: LeadSource | null = null;

  constructor(
    private fb: FormBuilder,
    private sourceService: LeadSourceService,
    private permissionsService: PermissionsService,
    private sessionService: SessionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      isActive: [true],
      sortOrder: [100],
    });

    this.loadPermissions();
  }

  get totalConfigured(): number {
    return this.sources.length;
  }

  get activeCount(): number {
    return this.sources.filter((source) => source.isActive).length;
  }

  get inactiveCount(): number {
    return this.sources.filter((source) => !source.isActive).length;
  }

  get firstSortOrder(): number | string {
    if (!this.sources.length) {
      return '-';
    }

    return Math.min(...this.sources.map((source) => source.sortOrder ?? 100));
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
          this.loadSources();
        }
      },
      error: () => {
        this.canView = false;
        this.canEdit = false;
        this.isAccessDenied = true;
      },
    });
  }

  loadSources(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.sourceService.list().subscribe({
      next: (sources) => {
        this.sources = sources ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error, 'Nao foi possivel carregar as fontes de origem.');
        this.isLoading = false;
      },
    });
  }

  openCreateModal(): void {
    if (!this.canEdit) {
      return;
    }

    this.editingSource = null;
    this.formErrorMessage = '';
    this.form.reset({
      name: '',
      isActive: true,
      sortOrder: 100,
    });
    this.showModal = true;
  }

  openEditModal(source: LeadSource): void {
    if (!this.canEdit) {
      return;
    }

    this.editingSource = source;
    this.formErrorMessage = '';
    this.form.reset({
      name: source.name,
      isActive: source.isActive,
      sortOrder: source.sortOrder ?? 100,
    });
    this.showModal = true;
  }

  closeModal(): void {
    if (this.isSaving) {
      return;
    }

    this.showModal = false;
    this.editingSource = null;
    this.formErrorMessage = '';
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
    const name = String(rawValue.name ?? '').trim();
    const sortOrder = this.normalizeSortOrder(rawValue.sortOrder);

    if (!name) {
      this.formErrorMessage = 'Informe o nome da fonte.';
      return;
    }

    this.isSaving = true;

    if (this.editingSource) {
      const payload: UpdateLeadSourceRequest = {
        name,
        isActive: Boolean(rawValue.isActive),
        sortOrder,
      };

      this.sourceService.update(this.editingSource.id, payload).subscribe({
        next: () => this.handleSaveSuccess('Fonte atualizada com sucesso.'),
        error: (error) => this.handleSaveError(error),
      });
      return;
    }

    const payload: CreateLeadSourceRequest = {
      name,
      isActive: Boolean(rawValue.isActive),
      sortOrder,
    };

    this.sourceService.create(payload).subscribe({
      next: () => this.handleSaveSuccess('Fonte cadastrada com sucesso.'),
      error: (error) => this.handleSaveError(error),
    });
  }

  toggleSource(source: LeadSource): void {
    if (!this.canEdit) {
      return;
    }

    this.sourceService.toggle(source.id, !source.isActive).subscribe({
      next: () => {
        this.toastr.success(source.isActive ? 'Fonte inativada.' : 'Fonte ativada.');
        this.loadSources();
      },
      error: (error) => {
        this.toastr.error(this.getErrorMessage(error, 'Nao foi possivel alterar o status da fonte.'));
      },
    });
  }

  removeSource(source: LeadSource): void {
    if (!this.canEdit) {
      return;
    }

    const confirmed = window.confirm(
      'Tem certeza que deseja inativar esta fonte de origem? Leads antigos continuarao preservados.'
    );

    if (!confirmed) {
      return;
    }

    this.sourceService.remove(source.id).subscribe({
      next: () => {
        this.toastr.success('Fonte inativada com sucesso.');
        this.loadSources();
      },
      error: (error) => {
        this.toastr.error(this.getErrorMessage(error, 'Nao foi possivel inativar a fonte.'));
      },
    });
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

  trackBySourceId(_: number, source: LeadSource): number {
    return source.id;
  }

  private handleSaveSuccess(message: string): void {
    this.toastr.success(message);
    this.isSaving = false;
    this.closeModal();
    this.loadSources();
  }

  private handleSaveError(error: unknown): void {
    this.formErrorMessage = this.getErrorMessage(error, 'Nao foi possivel salvar a fonte.');
    this.isSaving = false;
  }

  private normalizeSortOrder(value: unknown): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 100;
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
