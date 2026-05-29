import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LeadInterestRegionService } from 'src/app/core/services/lead-interest-region.service';
import { Permission, PermissionsService } from 'src/app/core/services/permissions.service';
import { SessionService } from 'src/app/core/session/session.service';
import {
  CreateLeadInterestRegionRequest,
  LeadInterestRegion,
  UpdateLeadInterestRegionRequest,
} from 'src/app/models/lead-interest-region';

@Component({
  selector: 'app-lead-interest-regions',
  templateUrl: './lead-interest-regions.component.html',
  styleUrls: ['./lead-interest-regions.component.scss'],
})
export class LeadInterestRegionsComponent implements OnInit {
  private readonly viewPermission = 'atendimento.regioes_interesse.visualizar';
  private readonly editPermission = 'atendimento.regioes_interesse.editar';
  private readonly adminPermission = 'sistema.admin.total';

  regions: LeadInterestRegion[] = [];
  form!: FormGroup;

  canView = false;
  canEdit = false;
  isAccessDenied = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  formErrorMessage = '';
  showModal = false;
  editingRegion: LeadInterestRegion | null = null;

  constructor(
    private fb: FormBuilder,
    private regionService: LeadInterestRegionService,
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
    return this.regions.length;
  }

  get activeCount(): number {
    return this.regions.filter((region) => region.isActive).length;
  }

  get inactiveCount(): number {
    return this.regions.filter((region) => !region.isActive).length;
  }

  get firstSortOrder(): number | string {
    if (!this.regions.length) {
      return '-';
    }

    return Math.min(...this.regions.map((region) => region.sortOrder ?? 100));
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
          this.loadRegions();
        }
      },
      error: () => {
        this.canView = false;
        this.canEdit = false;
        this.isAccessDenied = true;
      },
    });
  }

  loadRegions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.regionService.list().subscribe({
      next: (regions) => {
        this.regions = regions ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error, 'Nao foi possivel carregar as regioes de interesse.');
        this.isLoading = false;
      },
    });
  }

  openCreateModal(): void {
    if (!this.canEdit) {
      return;
    }

    this.editingRegion = null;
    this.formErrorMessage = '';
    this.form.reset({
      name: '',
      isActive: true,
      sortOrder: 100,
    });
    this.showModal = true;
  }

  openEditModal(region: LeadInterestRegion): void {
    if (!this.canEdit) {
      return;
    }

    this.editingRegion = region;
    this.formErrorMessage = '';
    this.form.reset({
      name: region.name,
      isActive: region.isActive,
      sortOrder: region.sortOrder ?? 100,
    });
    this.showModal = true;
  }

  closeModal(): void {
    if (this.isSaving) {
      return;
    }

    this.showModal = false;
    this.editingRegion = null;
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
      this.formErrorMessage = 'Informe o nome da regiao.';
      return;
    }

    this.isSaving = true;

    if (this.editingRegion) {
      const payload: UpdateLeadInterestRegionRequest = {
        name,
        isActive: Boolean(rawValue.isActive),
        sortOrder,
      };

      this.regionService.update(this.editingRegion.id, payload).subscribe({
        next: () => this.handleSaveSuccess('Regiao atualizada com sucesso.'),
        error: (error) => this.handleSaveError(error),
      });
      return;
    }

    const payload: CreateLeadInterestRegionRequest = {
      name,
      isActive: Boolean(rawValue.isActive),
      sortOrder,
    };

    this.regionService.create(payload).subscribe({
      next: () => this.handleSaveSuccess('Regiao cadastrada com sucesso.'),
      error: (error) => this.handleSaveError(error),
    });
  }

  toggleRegion(region: LeadInterestRegion): void {
    if (!this.canEdit) {
      return;
    }

    this.regionService.toggle(region.id, !region.isActive).subscribe({
      next: () => {
        this.toastr.success(region.isActive ? 'Regiao inativada.' : 'Regiao ativada.');
        this.loadRegions();
      },
      error: (error) => {
        this.toastr.error(this.getErrorMessage(error, 'Nao foi possivel alterar o status da regiao.'));
      },
    });
  }

  removeRegion(region: LeadInterestRegion): void {
    if (!this.canEdit) {
      return;
    }

    const confirmed = window.confirm(
      'Tem certeza que deseja inativar esta regiao de interesse? Leads antigos continuarao preservados.'
    );

    if (!confirmed) {
      return;
    }

    this.regionService.remove(region.id).subscribe({
      next: () => {
        this.toastr.success('Regiao inativada com sucesso.');
        this.loadRegions();
      },
      error: (error) => {
        this.toastr.error(this.getErrorMessage(error, 'Nao foi possivel inativar a regiao.'));
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

  trackByRegionId(_: number, region: LeadInterestRegion): number {
    return region.id;
  }

  private handleSaveSuccess(message: string): void {
    this.toastr.success(message);
    this.isSaving = false;
    this.closeModal();
    this.loadRegions();
  }

  private handleSaveError(error: unknown): void {
    this.formErrorMessage = this.getErrorMessage(error, 'Nao foi possivel salvar a regiao.');
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
