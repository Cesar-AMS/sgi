import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Cargos, Filial, Usuarios } from 'src/app/models/ContaBancaria';
import { AdminAccessService } from 'src/app/core/services/admin-access.service';
import { EmployeeControlRow, HrService } from 'src/app/core/services/hr.service';
import { EmployeeDetails, EmployeeDetailsService } from 'src/app/core/services/employee-details.service';
import { ExternalCollaboratorDetails, ExternalCollaboratorDetailsService } from 'src/app/core/services/external-collaborator-details.service';
import { EmployeeDocument, EmployeeDocumentsService } from 'src/app/core/services/employee-documents.service';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

type EmployeeForm = Partial<Usuarios> & {
  jobpositionId: number[];
};

type EmployeeTab = 'funcionarios' | 'externos' | 'sem_registro';

type EmploymentTypeOption = {
  value: string;
  label: string;
};

type EmployeeDocumentUploadForm = {
  documentType: string;
  documentLabel: string;
  notes: string;
};

type EmployeeDocumentTypeOption = {
  value: string;
  label: string;
};

type HierarchyOption = {
  id: number;
  name: string;
  managerId?: number | null;
  coordenatorId?: number | null;
  gestorId?: number | null;
};

@Component({
  selector: 'app-controle-funcionarios',
  templateUrl: './controle-funcionarios.component.html',
  styleUrl: './controle-funcionarios.component.scss',
})
export class ControleFuncionariosComponent implements OnInit {
  @ViewChild('employeeModal', { static: false }) employeeModal?: ModalDirective;
  @ViewChild('employeeModalBody', { static: false }) employeeModalBody?: ElementRef<HTMLElement>;
  @ViewChild('employeeDocumentFileInput', { static: false }) employeeDocumentFileInput?: ElementRef<HTMLInputElement>;

  rows: EmployeeControlRow[] = [];
  activeTab: EmployeeTab = 'funcionarios';
  searchTerm = '';
  roles: Cargos[] = [];
  branches: Filial[] = [];
  managers: Usuarios[] = [];
  coordinators: Usuarios[] = [];
  employeeForm: EmployeeForm = this.createEmptyForm();
  employeeDetailsForm: EmployeeDetails = this.createEmptyEmployeeDetails();
  externalDetailsForm: ExternalCollaboratorDetails = this.createEmptyExternalDetails();
  employeeDocuments: EmployeeDocument[] = [];
  employeeDocumentUploadForm: EmployeeDocumentUploadForm = this.createEmptyEmployeeDocumentUploadForm();
  selectedContractFile: File | null = null;
  selectedEmployeeDocumentFile: File | null = null;
  selectedDirectorFilterId?: number | null;
  workScheduleStart = '';
  workScheduleEnd = '';
  workScheduleObservation = '';
  readonly currencyOptions = {
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    precision: 2,
    allowNegative: false,
    align: 'left',
  };
  formMode: 'new' | 'edit' = 'new';
  loading = false;
  loadingOptions = false;
  loadingEmployeeDetails = false;
  loadingExternalDetails = false;
  loadingEmployeeDocuments = false;
  uploadingContract = false;
  uploadingEmployeeDocument = false;
  deletingEmployeeDocumentId: number | null = null;
  saving = false;
  errorMessage = '';
  formErrorMessage = '';
  employeeDocumentsErrorMessage = '';
  employmentTypes: EmploymentTypeOption[] = [
    { value: 'FUNCIONARIO', label: 'Funcionário da empresa' },
    { value: 'PJ', label: 'Pessoa Jurídica / Colaborador externo' },
    { value: 'SEM_REGISTRO', label: 'Sem registro' },
  ];
  employeeDocumentTypes: EmployeeDocumentTypeOption[] = [
    { value: 'RG_CPF', label: 'RG / CPF' },
    { value: 'CTPS', label: 'CTPS' },
    { value: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de residência' },
    { value: 'ATESTADO_ADMISSIONAL', label: 'Atestado admissional' },
    { value: 'FOTO_3X4', label: 'Foto 3x4' },
    { value: 'PIS_PASEP', label: 'PIS/PASEP' },
    { value: 'TITULO_ELEITOR', label: 'Título de eleitor' },
    { value: 'RESERVISTA', label: 'Reservista' },
    { value: 'CERTIDAO', label: 'Certidão' },
    { value: 'DEPENDENTE', label: 'Documento de dependente' },
    { value: 'OUTRO', label: 'Outro' },
  ];
  private readonly supportedEmploymentTypes = [
    'FUNCIONARIO',
    'SEM_REGISTRO',
    'PJ',
    'PARCEIRO',
    'TERCEIRO',
    'CONTADOR',
    'DIRETOR',
    'OUTRO',
  ];

  constructor(
    private hrService: HrService,
    private adminAccessService: AdminAccessService,
    private employeeDetailsService: EmployeeDetailsService,
    private externalCollaboratorDetailsService: ExternalCollaboratorDetailsService,
    private employeeDocumentsService: EmployeeDocumentsService
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

  get filteredRows(): EmployeeControlRow[] {
    const rows = this.rowsByActiveTab;
    const term = this.normalizeSearchText(this.searchTerm);

    if (!term) {
      return rows;
    }

    return rows.filter((row) => this.getEmployeeSearchValues(row)
      .some((value) => this.normalizeSearchText(value).includes(term)));
  }

  get rowsByActiveTab(): EmployeeControlRow[] {
    if (this.activeTab === 'externos') {
      return this.externalRows;
    }

    if (this.activeTab === 'sem_registro') {
      return this.unregisteredRows;
    }

    return this.employeeRows;
  }

  get employeeRows(): EmployeeControlRow[] {
    return this.rows.filter((row) => this.isEmployeeType(row.employmentType));
  }

  get externalRows(): EmployeeControlRow[] {
    return this.rows.filter((row) => this.isExternalType(row.employmentType));
  }

  get unregisteredRows(): EmployeeControlRow[] {
    return this.rows.filter((row) => this.isUnregisteredType(row.employmentType));
  }

  get employeeCount(): number {
    return this.employeeRows.length;
  }

  get externalCount(): number {
    return this.externalRows.length;
  }

  get unregisteredCount(): number {
    return this.unregisteredRows.length;
  }

  changeTab(tab: EmployeeTab): void {
    this.activeTab = tab;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  openNewEmployee(): void {
    this.formMode = 'new';
    this.formErrorMessage = '';
    this.employeeForm = this.createEmptyForm();
    this.employeeDetailsForm = this.createEmptyEmployeeDetails();
    this.externalDetailsForm = this.createEmptyExternalDetails();
    this.resetEmployeeDocuments();
    this.selectedContractFile = null;
    this.selectedDirectorFilterId = undefined;
    this.resetWorkScheduleFields();
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
          password: undefined,
          employmentType: this.normalizeEmploymentType(user.employmentType),
          admissionDate: this.toDateInputValue(user.admissionDate),
          jobpositionId: this.normalizeRoleIds(user.jobpositionId),
        };
        this.syncDirectorFilterFromSelectedGestor();
        this.loadCoordinators(user.managerId);
        this.employeeModal?.show();
        this.loadEmployeeDetails(user.id);
        this.loadExternalDetails(user.id);
        this.loadEmployeeDocuments(user.id);
      },
      error: (err) => {
        console.error('Erro ao carregar colaborador', err);
        this.errorMessage = 'Nao foi possivel carregar os dados do colaborador.';
      },
    });
  }

  saveEmployee(): void {
    this.formErrorMessage = '';

    if (!this.employeeForm.name?.trim()) {
      this.setFormError('Informe pelo menos o nome do colaborador.');
      return;
    }

    this.applyHierarchyBySelectedRole();

    const payload = this.buildUserPayload();
    const request = this.formMode === 'edit'
      ? this.adminAccessService.updateUser(payload)
      : this.adminAccessService.createUser(payload);

    this.saving = true;
    request.pipe(
      switchMap((response) => this.resolveSavedUserId(payload, response)),
      switchMap((userId) => this.saveDetailsByEmploymentType(userId, payload))
    ).subscribe({
      next: ({ userId, detailsSaved }) => {
        this.saving = false;
        if (!detailsSaved) {
          this.formMode = 'edit';
          this.employeeForm.id = userId;
          this.formErrorMessage = this.isExternalType(payload.employmentType)
            ? 'Colaborador salvo, mas nao foi possivel salvar os dados de PJ/externo. Revise e tente salvar novamente.'
            : 'Colaborador salvo, mas nao foi possivel salvar os dados admissionais. Revise e tente salvar novamente.';
          this.loadEmployees();
          return;
        }

        this.activeTab = this.resolveTabByEmploymentType(payload.employmentType);
        this.employeeModal?.hide();
        this.loadEmployees();
      },
      error: (err) => {
        console.error('Erro ao salvar colaborador', err);
        this.saving = false;
        this.setFormError(err?.error?.message || 'Nao foi possivel salvar o colaborador.');
      },
    });
  }

  get shouldShowEmployeeDetails(): boolean {
    return this.isEmployeeLikeType(this.employeeForm.employmentType);
  }

  get shouldShowExternalDetails(): boolean {
    return this.isExternalType(this.employeeForm.employmentType);
  }

  get basicSectionTitle(): string {
    if (this.isUnregisteredType(this.employeeForm.employmentType)) {
      return 'Identificação do funcionário sem registro';
    }

    return this.shouldShowEmployeeDetails
      ? 'Identificação do funcionário'
      : 'Identificação da Pessoa Jurídica / Colaborador externo';
  }

  get nameFieldLabel(): string {
    return this.shouldShowEmployeeDetails ? 'Nome' : 'Nome / Razao social';
  }

  get documentFieldLabel(): string {
    return this.shouldShowEmployeeDetails ? 'CPF' : 'CPF/CNPJ';
  }

  get shouldShowEmployeeBasicFields(): boolean {
    return this.shouldShowEmployeeDetails;
  }

  get isSelectedDirectorRole(): boolean {
    return this.hasRoleKind(this.selectedRoleNames(), 'diretor');
  }

  get isSelectedGestorRole(): boolean {
    return this.hasRoleKind(this.selectedRoleNames(), 'gestor');
  }

  get isSelectedManagerRole(): boolean {
    return this.hasRoleKind(this.selectedRoleNames(), 'gerente');
  }

  get isSelectedCoordinatorRole(): boolean {
    return this.hasRoleKind(this.selectedRoleNames(), 'coordenador');
  }

  get isSelectedSellerRole(): boolean {
    return this.selectedRoleNames().some((roleName) => this.isSellerRoleName(roleName));
  }

  get isSelectedOperationalRole(): boolean {
    return this.selectedRoleNames().some((roleName) => this.isOperationalRoleName(roleName));
  }

  get isSelectedCommercialRole(): boolean {
    return this.isSelectedDirectorRole
      || this.isSelectedGestorRole
      || this.isSelectedManagerRole
      || this.isSelectedCoordinatorRole
      || this.isSelectedSellerRole;
  }

  get directorOptions(): HierarchyOption[] {
    return this.getHierarchyOptionsByRole('diretor');
  }

  get gestorOptions(): HierarchyOption[] {
    const options = this.getHierarchyOptionsByRole('gestor');
    const directorId = this.normalizeOptionalNumber(this.selectedDirectorFilterId);
    return this.filterHierarchyOptionsByParent(options, 'gestorId', directorId);
  }

  get managerOptions(): HierarchyOption[] {
    const options = this.getHierarchyOptionsByRole('gerente');
    const gestorId = this.normalizeOptionalNumber(this.employeeForm.gestorId);
    return this.filterHierarchyOptionsByParent(options, 'gestorId', gestorId);
  }

  get coordinatorOptions(): HierarchyOption[] {
    const options = this.getHierarchyOptionsByRole('coordenador');
    const managerId = this.normalizeOptionalNumber(this.employeeForm.managerId);
    return this.filterHierarchyOptionsByParent(options, 'managerId', managerId);
  }

  get selectedRoleId(): number | undefined {
    return this.normalizeRoleIds(this.employeeForm.jobpositionId)[0];
  }

  get shouldShowDirectorField(): boolean {
    return this.shouldShowEmployeeBasicFields && this.isSelectedGestorRole;
  }

  get shouldShowDirectorFilterField(): boolean {
    return this.shouldShowEmployeeBasicFields
      && (this.isSelectedManagerRole || this.isSelectedCoordinatorRole || this.isSelectedSellerRole || this.isSelectedOperationalRole)
      && this.directorOptions.length > 0;
  }

  get shouldShowGestorField(): boolean {
    return this.shouldShowEmployeeBasicFields
      && (this.isSelectedManagerRole || this.isSelectedCoordinatorRole || this.isSelectedSellerRole || this.isSelectedOperationalRole);
  }

  get shouldShowManagerField(): boolean {
    return this.shouldShowEmployeeBasicFields
      && (this.isSelectedCoordinatorRole || this.isSelectedSellerRole || this.isSelectedOperationalRole);
  }

  get shouldShowCoordinatorField(): boolean {
    return this.shouldShowEmployeeBasicFields && (this.isSelectedSellerRole || this.isSelectedOperationalRole);
  }

  get hierarchyHelpText(): string {
    if (!this.shouldShowEmployeeBasicFields) {
      return '';
    }

    if (this.isSelectedDirectorRole) {
      return 'Diretor é o topo da hierarquia.';
    }

    if (this.isSelectedGestorRole) {
      return 'Gestor deve estar vinculado a um diretor.';
    }

    if (this.isSelectedManagerRole) {
      return 'Gerente deve estar vinculado a um gestor.';
    }

    if (this.isSelectedCoordinatorRole) {
      return 'Coordenador deve estar vinculado a um gerente.';
    }

    if (this.isSelectedSellerRole) {
      return 'Vendedor deve estar vinculado a um coordenador. O gerente sera definido pela equipe.';
    }

    if (this.isSelectedOperationalRole) {
      return 'Limpeza/Operacional pode ser vinculado a gerente ou coordenador, sem bloqueio nesta etapa.';
    }

    return 'Hierarquia comercial opcional para cargos fora de gerente, coordenador e vendedor/corretor.';
  }

  onManagerChange(): void {
    const managerId = this.normalizeOptionalNumber(this.employeeForm.managerId);
    this.loadCoordinators(managerId);
    this.employeeForm.coordenatorId = undefined;

    if (this.employeeForm.coordenatorId) {
      const coordinator = this.coordinatorOptions.find((option) => option.id === Number(this.employeeForm.coordenatorId));
      if (!coordinator) {
        this.employeeForm.coordenatorId = undefined;
      }
    }
  }

  onCoordinatorChange(): void {
    this.applyManagerFromSelectedCoordinator();
  }

  onDirectorFilterChange(): void {
    this.employeeForm.gestorId = undefined;
    this.employeeForm.managerId = undefined;
    this.employeeForm.coordenatorId = undefined;
  }

  onGestorChange(): void {
    this.syncDirectorFilterFromSelectedGestor();
    this.employeeForm.managerId = undefined;
    this.employeeForm.coordenatorId = undefined;
  }

  onRoleChange(roleId?: number | null): void {
    this.employeeForm.jobpositionId = roleId ? [Number(roleId)] : [];
    this.applyHierarchyBySelectedRole();
  }

  onWorkScheduleChange(): void {
    this.employeeDetailsForm.workScheduleNotes = this.composeWorkScheduleNotes();
  }

  onEmploymentTypeChange(): void {
    this.selectedContractFile = null;

    if (this.shouldShowEmployeeDetails) {
      this.loadEmployeeDetails(this.employeeForm.id);
      this.loadEmployeeDocuments(this.employeeForm.id);
      return;
    }

    this.resetEmployeeDocuments();

    if (this.shouldShowExternalDetails) {
      this.loadExternalDetails(this.employeeForm.id);
    }
  }

  onContractFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedContractFile = input.files?.[0] ?? null;
  }

  uploadContract(): void {
    const userId = this.employeeForm.id;
    if (!userId || !this.selectedContractFile) {
      this.formErrorMessage = 'Salve o colaborador e selecione um arquivo antes de enviar o contrato.';
      return;
    }

    this.uploadingContract = true;
    this.externalCollaboratorDetailsService.uploadContract(userId, this.selectedContractFile).subscribe({
      next: (details) => {
        this.externalDetailsForm = this.normalizeExternalDetailsForForm(details);
        this.selectedContractFile = null;
        this.uploadingContract = false;
      },
      error: (err) => {
        console.error('Erro ao enviar contrato do colaborador externo', err);
        this.formErrorMessage = err?.error?.message || 'Nao foi possivel enviar o contrato.';
        this.uploadingContract = false;
      },
    });
  }

  openContract(): void {
    if (!this.employeeForm.id) {
      return;
    }

    this.externalCollaboratorDetailsService.downloadContract(this.employeeForm.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        console.error('Erro ao abrir contrato do colaborador externo', err);
        this.formErrorMessage = err?.error?.message || 'Nao foi possivel abrir o contrato.';
      },
    });
  }

  onEmployeeDocumentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedEmployeeDocumentFile = input.files?.[0] ?? null;
  }

  uploadEmployeeDocument(): void {
    this.employeeDocumentsErrorMessage = '';
    const userId = this.employeeForm.id;

    if (!userId) {
      this.employeeDocumentsErrorMessage = 'Salve o funcionario antes de anexar documentos.';
      return;
    }

    if (!this.employeeDocumentUploadForm.documentType) {
      this.employeeDocumentsErrorMessage = 'Selecione o tipo do documento.';
      return;
    }

    if (!this.selectedEmployeeDocumentFile) {
      this.employeeDocumentsErrorMessage = 'Selecione um arquivo para enviar.';
      return;
    }

    const validationMessage = this.validateEmployeeDocumentFile(this.selectedEmployeeDocumentFile);
    if (validationMessage) {
      this.employeeDocumentsErrorMessage = validationMessage;
      return;
    }

    this.uploadingEmployeeDocument = true;
    this.employeeDocumentsService.upload(
      userId,
      this.selectedEmployeeDocumentFile,
      this.employeeDocumentUploadForm.documentType,
      this.employeeDocumentUploadForm.documentLabel,
      this.employeeDocumentUploadForm.notes
    ).subscribe({
      next: () => {
        this.uploadingEmployeeDocument = false;
        this.clearSelectedEmployeeDocumentFile();
        this.employeeDocumentUploadForm = this.createEmptyEmployeeDocumentUploadForm();
        this.loadEmployeeDocuments(userId);
      },
      error: (err) => {
        console.error('Erro ao enviar documento do funcionario', err);
        this.uploadingEmployeeDocument = false;
        this.employeeDocumentsErrorMessage = err?.error?.message || 'Nao foi possivel enviar o documento.';
      },
    });
  }

  openEmployeeDocument(document: EmployeeDocument): void {
    if (!document.id) {
      return;
    }

    this.employeeDocumentsErrorMessage = '';
    this.employeeDocumentsService.download(document.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        console.error('Erro ao abrir documento do funcionario', err);
        this.employeeDocumentsErrorMessage = err?.error?.message || 'Nao foi possivel abrir o documento.';
      },
    });
  }

  deleteEmployeeDocument(document: EmployeeDocument): void {
    if (!document.id || !confirm('Deseja excluir este documento?')) {
      return;
    }

    this.employeeDocumentsErrorMessage = '';
    this.deletingEmployeeDocumentId = document.id;
    this.employeeDocumentsService.delete(document.id).subscribe({
      next: () => {
        this.deletingEmployeeDocumentId = null;
        if (this.employeeForm.id) {
          this.loadEmployeeDocuments(this.employeeForm.id);
        }
      },
      error: (err) => {
        console.error('Erro ao excluir documento do funcionario', err);
        this.deletingEmployeeDocumentId = null;
        this.employeeDocumentsErrorMessage = err?.error?.message || 'Nao foi possivel excluir o documento.';
      },
    });
  }

  getEmployeeDocumentTypeLabel(value?: string | null): string {
    return this.employeeDocumentTypes.find((type) => type.value === value)?.label || value || '-';
  }

  formatFileSize(size?: number | null): string {
    if (!size || size <= 0) {
      return '-';
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatDateTime(value?: string | null): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.substring(0, 10);
    }

    return date.toLocaleDateString('pt-BR');
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
        this.managers = this.filterUsersByRole(managers ?? [], 'gerente');
      },
      error: (err) => console.error('Erro ao carregar gerentes', err),
    });

    this.adminAccessService.listBranches().subscribe({
      next: (branches) => {
        this.branches = branches ?? [];
      },
      error: (err) => console.error('Erro ao carregar unidades/filiais', err),
    });

    this.loadCoordinators();
  }

  private loadCoordinators(managerId?: number | null): void {
    this.adminAccessService.listCoordinators(managerId).subscribe({
      next: (coordinators) => {
        this.coordinators = this.filterUsersByRole(coordinators ?? [], 'coordenador');
      },
      error: (err) => console.error('Erro ao carregar coordenadores', err),
    });
  }

  private applyHierarchyBySelectedRole(): void {
    if (!this.shouldShowEmployeeBasicFields) {
      return;
    }

    if (this.isSelectedDirectorRole) {
      this.selectedDirectorFilterId = undefined;
      this.employeeForm.gestorId = undefined;
      this.employeeForm.managerId = undefined;
      this.employeeForm.coordenatorId = undefined;
      return;
    }

    if (this.isSelectedGestorRole) {
      return;
    }

    if (this.isSelectedManagerRole) {
      return;
    }

    if (this.isSelectedCoordinatorRole) {
      return;
    }

    if (this.isSelectedSellerRole) {
      this.applyManagerFromSelectedCoordinator();
    }
  }

  private filterHierarchyOptionsByParent(
    options: HierarchyOption[],
    parentKey: 'gestorId' | 'managerId',
    parentId?: number | null
  ): HierarchyOption[] {
    if (!parentId) {
      return options;
    }

    const filtered = options.filter((option) => this.normalizeOptionalNumber(option[parentKey]) === parentId);
    return filtered.length ? filtered : options;
  }

  private syncDirectorFilterFromSelectedGestor(): void {
    const gestorId = this.normalizeOptionalNumber(this.employeeForm.gestorId);
    if (!gestorId || !this.shouldShowDirectorFilterField) {
      return;
    }

    const gestor = this.getHierarchyOptionsByRole('gestor')
      .find((option) => Number(option.id) === gestorId);
    const directorId = this.normalizeOptionalNumber(gestor?.gestorId);
    if (directorId) {
      this.selectedDirectorFilterId = directorId;
    }
  }

  private setFormError(message: string): void {
    this.formErrorMessage = message;
    setTimeout(() => this.employeeModalBody?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  private getEmployeeSearchValues(row: EmployeeControlRow): unknown[] {
    const extendedRow = row as EmployeeControlRow & {
      cpf?: string | null;
      cpfCnpj?: string | null;
      document?: string | null;
      cellphone?: string | null;
      phone?: string | null;
      telefone?: string | null;
      managerName?: string | null;
      coordenatorName?: string | null;
      coordinatorName?: string | null;
    };

    return [
      row.name,
      extendedRow.cpf,
      extendedRow.cpfCnpj,
      extendedRow.document,
      row.cargo,
      row.gerente,
      row.coordenador,
      extendedRow.managerName,
      extendedRow.coordenatorName,
      extendedRow.coordinatorName,
      extendedRow.cellphone,
      extendedRow.phone,
      extendedRow.telefone,
      row.email,
      row.branch,
      row.employmentTypeLabel,
    ];
  }

  private normalizeSearchText(value: unknown): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');
  }

  private applyManagerFromSelectedCoordinator(): void {
    const coordinatorId = this.normalizeOptionalNumber(this.employeeForm.coordenatorId);
    if (!coordinatorId) {
      return;
    }

    const coordinator = this.coordinatorOptions.find((item) => Number(item.id) === coordinatorId)
      ?? this.coordinators.find((item) => Number(item.id) === coordinatorId)
      ?? this.rows.find((item) => item.id === coordinatorId);

    const managerId = this.normalizeOptionalNumber(coordinator?.managerId);
    if (managerId) {
      this.employeeForm.managerId = managerId;
    }

    const gestorId = this.normalizeOptionalNumber(coordinator?.gestorId);
    if (gestorId && !this.employeeForm.gestorId) {
      this.employeeForm.gestorId = gestorId;
    }
  }

  private selectedRoleNames(): string[] {
    const roleIds = this.normalizeRoleIds(this.employeeForm.jobpositionId);
    const roleNames = roleIds
      .map((roleId) => this.roles.find((role) => Number(role.id) === roleId)?.name)
      .filter((roleName): roleName is string => !!roleName?.trim());

    return this.distinctRoleNames(roleNames);
  }

  private getHierarchyOptionsByRole(roleKind: 'diretor' | 'gestor' | 'gerente' | 'coordenador'): HierarchyOption[] {
    const byRows = this.rows
      .filter((row) => this.hasRoleKind([row.cargo], roleKind))
      .map((row) => ({
        id: row.id,
        name: row.name,
        managerId: row.managerId,
        coordenatorId: row.coordenatorId,
        gestorId: row.gestorId ?? this.findLoadedUser(row.id)?.gestorId,
      }));

    if (byRows.length) {
      return byRows;
    }

    const fallbackUsers = roleKind === 'gerente'
      ? this.managers
      : roleKind === 'coordenador'
        ? this.coordinators
        : [];

    return fallbackUsers.map((user) => ({
      id: user.id,
      name: user.name,
      managerId: user.managerId,
      coordenatorId: user.coordenatorId,
      gestorId: user.gestorId,
    }));
  }

  private findLoadedUser(userId: number): Usuarios | undefined {
    return [...this.managers, ...this.coordinators].find((user) => Number(user.id) === Number(userId));
  }

  private filterUsersByRole(users: Usuarios[], roleKind: 'diretor' | 'gestor' | 'gerente' | 'coordenador'): Usuarios[] {
    const filtered = users.filter((user) => this.hasRoleKind(this.roleNamesFromUser(user), roleKind));
    return filtered.length ? filtered : users;
  }

  private roleNamesFromUser(user: Usuarios): string[] {
    const roleNames = [
      ...(user.roleName?.split(',') ?? []),
      ...(user.roleNames ?? []),
      ...this.normalizeRoleIds(user.jobpositionId)
        .map((roleId) => this.roles.find((role) => Number(role.id) === roleId)?.name),
    ];

    return this.distinctRoleNames(roleNames);
  }

  private distinctRoleNames(roleNames: Array<string | undefined | null>): string[] {
    const normalized = roleNames
      .map((roleName) => roleName?.trim())
      .filter((roleName): roleName is string => !!roleName);

    return Array.from(new Map(
      normalized.map((roleName) => [this.normalizeRoleName(roleName), roleName])
    ).values());
  }

  private hasRoleKind(roleNames: string[], roleKind: 'diretor' | 'gestor' | 'gerente' | 'coordenador'): boolean {
    return roleNames.some((roleName) => this.normalizeRoleName(roleName).includes(roleKind));
  }

  private isSellerRoleName(roleName: string): boolean {
    const normalized = this.normalizeRoleName(roleName);
    return normalized.includes('vendedor') || normalized.includes('corretor');
  }

  private isOperationalRoleName(roleName: string): boolean {
    const normalized = this.normalizeRoleName(roleName);
    return normalized.includes('limpeza') || normalized.includes('operacional');
  }

  private normalizeRoleName(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');
  }

  private buildUserPayload(): Usuarios {
    this.applyHierarchyBySelectedRole();

    const payload = {
      ...this.employeeForm,
      jobpositionId: this.normalizeRoleIds(this.employeeForm.jobpositionId),
      hidden: !!this.employeeForm.hidden,
      admissionDate: this.normalizeDateInput(this.employeeForm.admissionDate),
      employmentType: this.normalizeEmploymentType(this.employeeForm.employmentType),
      managerId: this.normalizeOptionalNumber(this.employeeForm.managerId),
      coordenatorId: this.normalizeOptionalNumber(this.employeeForm.coordenatorId),
      gestorId: this.normalizeOptionalNumber(this.employeeForm.gestorId),
    } as Usuarios;

    delete (payload as Partial<Usuarios>).password;

    return payload;
  }

  private buildEmployeeDetailsPayload(userId: number): EmployeeDetails {
    this.onWorkScheduleChange();

    return {
      ...this.employeeDetailsForm,
      userId,
      rg: this.normalizeText(this.employeeDetailsForm.rg),
      rgIssueDate: this.normalizeDateInput(this.employeeDetailsForm.rgIssueDate),
      rgIssuer: this.normalizeText(this.employeeDetailsForm.rgIssuer),
      rgState: this.normalizeText(this.employeeDetailsForm.rgState),
      birthDate: this.normalizeDateInput(this.employeeDetailsForm.birthDate),
      birthCity: this.normalizeText(this.employeeDetailsForm.birthCity),
      birthState: this.normalizeText(this.employeeDetailsForm.birthState),
      nationality: this.normalizeText(this.employeeDetailsForm.nationality),
      maritalStatus: this.normalizeText(this.employeeDetailsForm.maritalStatus),
      spouseName: this.normalizeText(this.employeeDetailsForm.spouseName),
      fatherName: this.normalizeText(this.employeeDetailsForm.fatherName),
      motherName: this.normalizeText(this.employeeDetailsForm.motherName),
      educationLevel: this.normalizeText(this.employeeDetailsForm.educationLevel),
      educationStatus: this.normalizeText(this.employeeDetailsForm.educationStatus),
      ctpsNumber: this.normalizeText(this.employeeDetailsForm.ctpsNumber),
      ctpsSeries: this.normalizeText(this.employeeDetailsForm.ctpsSeries),
      ctpsState: this.normalizeText(this.employeeDetailsForm.ctpsState),
      ctpsIssueDate: this.normalizeDateInput(this.employeeDetailsForm.ctpsIssueDate),
      pisPasep: this.normalizeText(this.employeeDetailsForm.pisPasep),
      susNumber: this.normalizeText(this.employeeDetailsForm.susNumber),
      voterTitle: this.normalizeText(this.employeeDetailsForm.voterTitle),
      voterZone: this.normalizeText(this.employeeDetailsForm.voterZone),
      voterSection: this.normalizeText(this.employeeDetailsForm.voterSection),
      reservistNumber: this.normalizeText(this.employeeDetailsForm.reservistNumber),
      reservistCategory: this.normalizeText(this.employeeDetailsForm.reservistCategory),
      salary: this.normalizeOptionalDecimal(this.employeeDetailsForm.salary),
      functionName: this.normalizeText(this.employeeDetailsForm.functionName),
      monthlyWorkload: this.normalizeOptionalDecimal(this.employeeDetailsForm.monthlyWorkload),
      weeklyWorkload: this.normalizeOptionalDecimal(this.employeeDetailsForm.weeklyWorkload),
      dayOff: this.normalizeText(this.employeeDetailsForm.dayOff),
      experienceContractDays: this.normalizeOptionalInteger(this.employeeDetailsForm.experienceContractDays),
      experienceExtensionDays: this.normalizeOptionalInteger(this.employeeDetailsForm.experienceExtensionDays),
      transportVoucherDiscount: this.normalizeOptionalDecimal(this.employeeDetailsForm.transportVoucherDiscount),
      workScheduleNotes: this.normalizeText(this.employeeDetailsForm.workScheduleNotes),
      dependentNotes: this.normalizeText(this.employeeDetailsForm.dependentNotes),
      notes: this.normalizeText(this.employeeDetailsForm.notes),
    };
  }

  private buildExternalDetailsPayload(userId: number): ExternalCollaboratorDetails {
    return {
      ...this.externalDetailsForm,
      userId,
      startDate: this.normalizeDateInput(this.externalDetailsForm.startDate),
      endDate: this.normalizeDateInput(this.externalDetailsForm.endDate),
      notes: this.normalizeText(this.externalDetailsForm.notes),
    };
  }

  private createEmptyForm(): EmployeeForm {
    return {
      name: '',
      email: '',
      cpf: '',
      cellphone: '',
      address: '',
      admissionDate: '',
      hidden: false,
      employmentType: 'FUNCIONARIO',
      jobpositionId: [],
      filial: undefined,
      managerId: undefined,
      coordenatorId: undefined,
      gestorId: undefined,
    };
  }

  private createEmptyEmployeeDetails(): EmployeeDetails {
    return {
      firstJob: null,
      hasDependents: null,
    };
  }

  private createEmptyExternalDetails(): ExternalCollaboratorDetails {
    return {};
  }

  private createEmptyEmployeeDocumentUploadForm(): EmployeeDocumentUploadForm {
    return {
      documentType: '',
      documentLabel: '',
      notes: '',
    };
  }

  private loadEmployeeDetails(userId?: number): void {
    this.employeeDetailsForm = this.createEmptyEmployeeDetails();
    this.resetWorkScheduleFields();

    if (!userId || !this.shouldShowEmployeeDetails) {
      return;
    }

    this.loadingEmployeeDetails = true;
    this.employeeDetailsService.getByUserId(userId).subscribe({
      next: (details) => {
        this.employeeDetailsForm = this.normalizeEmployeeDetailsForForm(details);
        this.loadingEmployeeDetails = false;
      },
      error: (err) => {
        this.loadingEmployeeDetails = false;
        if (err?.status === 404) {
          this.employeeDetailsForm = this.createEmptyEmployeeDetails();
          return;
        }

        console.error('Erro ao carregar dados admissionais', err);
        this.formErrorMessage = 'Nao foi possivel carregar os dados admissionais. Os dados basicos podem ser editados normalmente.';
      },
    });
  }

  private loadEmployeeDocuments(userId?: number): void {
    this.resetEmployeeDocuments(false);

    if (!userId || !this.shouldShowEmployeeDetails) {
      return;
    }

    this.loadingEmployeeDocuments = true;
    this.employeeDocumentsService.getByUserId(userId).subscribe({
      next: (documents) => {
        this.employeeDocuments = documents ?? [];
        this.loadingEmployeeDocuments = false;
      },
      error: (err) => {
        console.error('Erro ao carregar documentos do funcionario', err);
        this.employeeDocuments = [];
        this.employeeDocumentsErrorMessage = 'Nao foi possivel carregar os documentos do funcionario.';
        this.loadingEmployeeDocuments = false;
      },
    });
  }

  private resetEmployeeDocuments(resetForm = true): void {
    this.employeeDocuments = [];
    this.employeeDocumentsErrorMessage = '';
    this.loadingEmployeeDocuments = false;
    this.uploadingEmployeeDocument = false;
    this.deletingEmployeeDocumentId = null;
    this.clearSelectedEmployeeDocumentFile();

    if (resetForm) {
      this.employeeDocumentUploadForm = this.createEmptyEmployeeDocumentUploadForm();
    }
  }

  private clearSelectedEmployeeDocumentFile(): void {
    this.selectedEmployeeDocumentFile = null;
    if (this.employeeDocumentFileInput?.nativeElement) {
      this.employeeDocumentFileInput.nativeElement.value = '';
    }
  }

  private saveEmployeeDetailsIfNeeded(userId: number, payload: Usuarios): Observable<{ userId: number; detailsSaved: boolean }> {
    if (!this.isEmployeeLikeType(payload.employmentType)) {
      return of({ userId, detailsSaved: true });
    }

    return this.employeeDetailsService.upsertByUserId(userId, this.buildEmployeeDetailsPayload(userId)).pipe(
      map(() => ({ userId, detailsSaved: true })),
      catchError((err) => {
        console.error('Erro ao salvar dados admissionais', err);
        return of({ userId, detailsSaved: false });
      })
    );
  }

  private saveDetailsByEmploymentType(userId: number, payload: Usuarios): Observable<{ userId: number; detailsSaved: boolean }> {
    if (this.isEmployeeLikeType(payload.employmentType)) {
      return this.saveEmployeeDetailsIfNeeded(userId, payload);
    }

    if (this.isExternalType(payload.employmentType)) {
      return this.externalCollaboratorDetailsService.upsertByUserId(userId, this.buildExternalDetailsPayload(userId)).pipe(
        switchMap(() => this.uploadSelectedContractIfNeeded(userId)),
        map(() => ({ userId, detailsSaved: true })),
        catchError((err) => {
          console.error('Erro ao salvar dados do colaborador externo', err);
          return of({ userId, detailsSaved: false });
        })
      );
    }

    return of({ userId, detailsSaved: true });
  }

  private uploadSelectedContractIfNeeded(userId: number): Observable<ExternalCollaboratorDetails | null> {
    if (!this.selectedContractFile) {
      return of(null);
    }

    return this.externalCollaboratorDetailsService.uploadContract(userId, this.selectedContractFile).pipe(
      map((details) => {
        this.externalDetailsForm = this.normalizeExternalDetailsForForm(details);
        this.selectedContractFile = null;
        return details;
      })
    );
  }

  private validateEmployeeDocumentFile(file: File): string | null {
    const allowedContentTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxFileSize = 10 * 1024 * 1024;

    if (!allowedContentTypes.includes(file.type)) {
      return 'Tipo de arquivo inválido. Envie PDF, JPG ou PNG.';
    }

    if (file.size > maxFileSize) {
      return 'Arquivo deve ter no máximo 10 MB.';
    }

    return null;
  }

  private loadExternalDetails(userId?: number): void {
    this.externalDetailsForm = this.createEmptyExternalDetails();

    if (!userId || !this.shouldShowExternalDetails) {
      return;
    }

    this.loadingExternalDetails = true;
    this.externalCollaboratorDetailsService.getByUserId(userId).subscribe({
      next: (details) => {
        this.externalDetailsForm = this.normalizeExternalDetailsForForm(details);
        this.loadingExternalDetails = false;
      },
      error: (err) => {
        this.loadingExternalDetails = false;
        if (err?.status === 404) {
          this.externalDetailsForm = this.createEmptyExternalDetails();
          return;
        }

        console.error('Erro ao carregar dados do colaborador externo', err);
        this.formErrorMessage = 'Nao foi possivel carregar os dados de PJ/externo. Os dados basicos podem ser editados normalmente.';
      },
    });
  }

  private resolveSavedUserId(payload: Usuarios, response: unknown): Observable<number> {
    const responseId = this.extractUserIdFromResponse(response);
    if (responseId) {
      return of(responseId);
    }

    if (this.formMode === 'edit' && payload.id) {
      return of(payload.id);
    }

    const email = payload.email?.trim().toLowerCase();
    const name = payload.name?.trim().toLowerCase();

    return this.adminAccessService.listUsersByStatus('all').pipe(
      map((users) => {
        const created = (users ?? []).find((user) => {
          const userEmail = user.email?.trim().toLowerCase();
          const userName = user.name?.trim().toLowerCase();

          return email
            ? userEmail === email
            : !!name && userName === name;
        });

        if (!created?.id) {
          throw new Error('Nao foi possivel localizar o usuario criado para salvar os dados admissionais.');
        }

        return created.id;
      })
    );
  }

  private extractUserIdFromResponse(response: unknown): number | null {
    const value = response as { id?: number; userId?: number; data?: { id?: number; userId?: number } } | null;
    const id = value?.id ?? value?.userId ?? value?.data?.id ?? value?.data?.userId;
    return id && Number.isFinite(Number(id)) ? Number(id) : null;
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

  private normalizeEmploymentType(value?: string | null): string {
    const normalized = value?.trim().toUpperCase();
    if (!normalized) {
      return 'FUNCIONARIO';
    }

    const allowed = this.supportedEmploymentTypes.includes(normalized);
    return allowed ? normalized : 'OUTRO';
  }

  private normalizeEmployeeDetailsForForm(details: EmployeeDetails): EmployeeDetails {
    const normalized = {
      ...details,
      rgIssueDate: this.toDateInputValue(details.rgIssueDate),
      birthDate: this.toDateInputValue(details.birthDate),
      ctpsIssueDate: this.toDateInputValue(details.ctpsIssueDate),
    };

    this.syncWorkScheduleFields(normalized.workScheduleNotes);
    return normalized;
  }

  private normalizeExternalDetailsForForm(details: ExternalCollaboratorDetails): ExternalCollaboratorDetails {
    return {
      ...details,
      startDate: this.toDateInputValue(details.startDate),
      endDate: this.toDateInputValue(details.endDate),
    };
  }

  private normalizeText(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private normalizeDateInput(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.substring(0, 10) : null;
  }

  private normalizeOptionalDecimal(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  private resetWorkScheduleFields(): void {
    this.workScheduleStart = '';
    this.workScheduleEnd = '';
    this.workScheduleObservation = '';
  }

  private syncWorkScheduleFields(value?: string | null): void {
    this.resetWorkScheduleFields();

    const text = value?.trim();
    if (!text) {
      return;
    }

    const match = text.match(/^(\d{2}:\d{2})\s*(?:às|as|-|a)\s*(\d{2}:\d{2})(?:,?\s*(.*))?$/i);
    if (!match) {
      this.workScheduleObservation = text;
      return;
    }

    this.workScheduleStart = match[1];
    this.workScheduleEnd = match[2];
    this.workScheduleObservation = match[3]?.trim() ?? '';
  }

  private composeWorkScheduleNotes(): string | null {
    const start = this.workScheduleStart?.trim();
    const end = this.workScheduleEnd?.trim();
    const observation = this.workScheduleObservation?.trim();

    if (start && end) {
      return observation ? `${start} às ${end}, ${observation}` : `${start} às ${end}`;
    }

    if (start || end) {
      const partial = [start, end].filter(Boolean).join(' - ');
      return observation ? `${partial}, ${observation}` : partial;
    }

    return observation || null;
  }

  private normalizeOptionalInteger(value: unknown): number | null {
    const numberValue = this.normalizeOptionalDecimal(value);
    return numberValue === null ? null : Math.trunc(numberValue);
  }

  private isEmployeeType(value?: string | null): boolean {
    return this.normalizeEmploymentType(value) === 'FUNCIONARIO';
  }

  private isUnregisteredType(value?: string | null): boolean {
    return this.normalizeEmploymentType(value) === 'SEM_REGISTRO';
  }

  private isEmployeeLikeType(value?: string | null): boolean {
    const normalized = this.normalizeEmploymentType(value);
    return normalized === 'FUNCIONARIO' || normalized === 'SEM_REGISTRO';
  }

  private isExternalType(value?: string | null): boolean {
    return ['PJ', 'PARCEIRO', 'TERCEIRO', 'CONTADOR', 'DIRETOR', 'OUTRO']
      .includes(this.normalizeEmploymentType(value));
  }

  private resolveTabByEmploymentType(value?: string | null): EmployeeTab {
    if (this.isExternalType(value)) {
      return 'externos';
    }

    if (this.isUnregisteredType(value)) {
      return 'sem_registro';
    }

    return 'funcionarios';
  }

  private toDateInputValue(value?: string | null): string {
    if (!value) {
      return '';
    }

    return value.substring(0, 10);
  }
}
