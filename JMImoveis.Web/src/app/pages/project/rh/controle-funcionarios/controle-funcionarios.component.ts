import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Cargos, Usuarios } from 'src/app/models/ContaBancaria';
import { AdminAccessService } from 'src/app/core/services/admin-access.service';
import { EmployeeControlRow, HrService } from 'src/app/core/services/hr.service';

type EmployeeForm = Partial<Usuarios> & {
  password?: string;
  jobpositionId: number[];
};

@Component({
  selector: 'app-controle-funcionarios',
  templateUrl: './controle-funcionarios.component.html',
  styleUrl: './controle-funcionarios.component.scss',
})
export class ControleFuncionariosComponent implements OnInit {
  @ViewChild('employeeModal', { static: false }) employeeModal?: ModalDirective;

  rows: EmployeeControlRow[] = [];
  roles: Cargos[] = [];
  managers: Usuarios[] = [];
  coordinators: Usuarios[] = [];
  employeeForm: EmployeeForm = this.createEmptyForm();
  formMode: 'new' | 'edit' = 'new';
  loading = false;
  loadingOptions = false;
  saving = false;
  errorMessage = '';
  formErrorMessage = '';

  constructor(
    private hrService: HrService,
    private adminAccessService: AdminAccessService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadOptions();
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    this.hrService.getEmployeeControl().subscribe({
      next: (rows) => {
        this.rows = rows;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar colaboradores', err);
        this.rows = [];
        this.errorMessage = 'Nao foi possivel carregar os colaboradores.';
        this.loading = false;
      },
    });
  }

  openNewEmployee(): void {
    this.formMode = 'new';
    this.formErrorMessage = '';
    this.employeeForm = this.createEmptyForm();
    this.loadCoordinators();
    this.employeeModal?.show();
  }

  openEditEmployee(row: EmployeeControlRow): void {
    this.formMode = 'edit';
    this.formErrorMessage = '';
    this.saving = false;

    this.adminAccessService.getUserById(row.id).subscribe({
      next: (user) => {
        this.employeeForm = {
          ...user,
          password: '',
          admissionDate: this.toDateInputValue(user.admissionDate),
          jobpositionId: this.normalizeRoleIds(user.jobpositionId),
        };
        this.loadCoordinators(user.managerId);
        this.employeeModal?.show();
      },
      error: (err) => {
        console.error('Erro ao carregar colaborador', err);
        this.errorMessage = 'Nao foi possivel carregar os dados do colaborador.';
      },
    });
  }

  saveEmployee(): void {
    this.formErrorMessage = '';

    if (!this.employeeForm.name?.trim() || !this.employeeForm.email?.trim()) {
      this.formErrorMessage = 'Preencha nome e email.';
      return;
    }

    if (!this.employeeForm.cpf?.trim() || !this.employeeForm.cellphone?.trim() || !this.employeeForm.address?.trim()) {
      this.formErrorMessage = 'Preencha CPF, telefone e endereco.';
      return;
    }

    if (!this.employeeForm.jobpositionId?.length) {
      this.formErrorMessage = 'Selecione pelo menos um cargo/perfil.';
      return;
    }

    if (this.formMode === 'new' && !this.employeeForm.password?.trim()) {
      this.formErrorMessage = 'Informe uma senha inicial para o colaborador.';
      return;
    }

    const payload = this.buildUserPayload();
    const request = this.formMode === 'edit'
      ? this.adminAccessService.updateUser(payload)
      : this.adminAccessService.createUser(payload);

    this.saving = true;
    request.subscribe({
      next: () => {
        this.saving = false;
        this.employeeModal?.hide();
        this.loadEmployees();
      },
      error: (err) => {
        console.error('Erro ao salvar colaborador', err);
        this.saving = false;
        this.formErrorMessage = err?.error?.message || 'Nao foi possivel salvar o colaborador.';
      },
    });
  }

  onManagerChange(): void {
    this.employeeForm.coordenatorId = undefined;
    this.loadCoordinators(this.employeeForm.managerId);
  }

  private loadOptions(): void {
    this.loadingOptions = true;
    this.adminAccessService.listRoles().subscribe({
      next: (roles) => {
        this.roles = roles ?? [];
        this.loadingOptions = false;
      },
      error: (err) => {
        console.error('Erro ao carregar cargos', err);
        this.loadingOptions = false;
      },
    });

    this.adminAccessService.listManagers().subscribe({
      next: (managers) => {
        this.managers = managers ?? [];
      },
      error: (err) => console.error('Erro ao carregar gerentes', err),
    });

    this.loadCoordinators();
  }

  private loadCoordinators(managerId?: number | null): void {
    this.adminAccessService.listCoordinators(managerId).subscribe({
      next: (coordinators) => {
        this.coordinators = coordinators ?? [];
      },
      error: (err) => console.error('Erro ao carregar coordenadores', err),
    });
  }

  private buildUserPayload(): Usuarios {
    const payload = {
      ...this.employeeForm,
      jobpositionId: this.normalizeRoleIds(this.employeeForm.jobpositionId),
      hidden: !!this.employeeForm.hidden,
      managerId: this.normalizeOptionalNumber(this.employeeForm.managerId),
      coordenatorId: this.normalizeOptionalNumber(this.employeeForm.coordenatorId),
      gestorId: this.normalizeOptionalNumber(this.employeeForm.gestorId),
    } as Usuarios;

    if (this.formMode === 'edit' && !this.employeeForm.password?.trim()) {
      payload.password = '';
    }

    return payload;
  }

  private createEmptyForm(): EmployeeForm {
    return {
      name: '',
      email: '',
      password: '',
      cpf: '',
      cellphone: '',
      address: '',
      admissionDate: '',
      hidden: false,
      jobpositionId: [],
      managerId: undefined,
      coordenatorId: undefined,
      gestorId: undefined,
    };
  }

  private normalizeRoleIds(value: number | number[] | undefined): number[] {
    const roleIds = Array.isArray(value)
      ? value
      : value
        ? [value]
        : [];

    return roleIds
      .map((roleId) => Number(roleId))
      .filter((roleId) => Number.isFinite(roleId) && roleId > 0);
  }

  private normalizeOptionalNumber(value: number | string | null | undefined): number | undefined {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined;
  }

  private toDateInputValue(value?: string | null): string {
    if (!value) {
      return '';
    }

    return value.substring(0, 10);
  }
}
