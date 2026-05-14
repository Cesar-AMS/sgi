import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Cargos, Usuarios } from 'src/app/models/ContaBancaria';
import { AdminAccessService } from 'src/app/core/services/admin-access.service';
import { EmployeeControlRow, HrService } from 'src/app/core/services/hr.service';
import { EmployeeDetails, EmployeeDetailsService } from 'src/app/core/services/employee-details.service';
import { ExternalCollaboratorDetails, ExternalCollaboratorDetailsService } from 'src/app/core/services/external-collaborator-details.service';
import { EmployeeDocument, EmployeeDocumentsService } from 'src/app/core/services/employee-documents.service';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';

type EmployeeForm = Partial<Usuarios> & {
  password?: string;
  jobpositionId: number[];
};

type EmployeeTab = 'funcionarios' | 'externos';

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

@Component({
  selector: 'app-controle-funcionarios',
  templateUrl: './controle-funcionarios.component.html',
  styleUrl: './controle-funcionarios.component.scss',
})
export class ControleFuncionariosComponent implements OnInit {
  @ViewChild('employeeModal', { static: false }) employeeModal?: ModalDirective;
  @ViewChild('employeeDocumentFileInput', { static: false }) employeeDocumentFileInput?: ElementRef<HTMLInputElement>;

  rows: EmployeeControlRow[] = [];
  activeTab: EmployeeTab = 'funcionarios';
  roles: Cargos[] = [];
  managers: Usuarios[] = [];
  coordinators: Usuarios[] = [];
  employeeForm: EmployeeForm = this.createEmptyForm();
  employeeDetailsForm: EmployeeDetails = this.createEmptyEmployeeDetails();
  externalDetailsForm: ExternalCollaboratorDetails = this.createEmptyExternalDetails();
  employeeDocuments: EmployeeDocument[] = [];
  employeeDocumentUploadForm: EmployeeDocumentUploadForm = this.createEmptyEmployeeDocumentUploadForm();
  selectedContractFile: File | null = null;
  selectedEmployeeDocumentFile: File | null = null;
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
  ];
  employeeDocumentTypes: EmployeeDocumentTypeOption[] = [
    { value: 'RG_CPF', label: 'RG / CPF' },
    { value: 'CTPS', label: 'CTPS' },
    { value: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de residencia' },
    { value: 'ATESTADO_ADMISSIONAL', label: 'Atestado admissional' },
    { value: 'FOTO_3X4', label: 'Foto 3x4' },
    { value: 'PIS_PASEP', label: 'PIS/PASEP' },
    { value: 'TITULO_ELEITOR', label: 'Titulo de eleitor' },
    { value: 'RESERVISTA', label: 'Reservista' },
    { value: 'CERTIDAO', label: 'Certidao' },
    { value: 'DEPENDENTE', label: 'Documento de dependente' },
    { value: 'OUTRO', label: 'Outro' },
  ];
  private readonly supportedEmploymentTypes = [
    'FUNCIONARIO',
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
    if (this.activeTab === 'externos') {
      return this.externalRows;
    }

    return this.employeeRows;
  }

  get employeeRows(): EmployeeControlRow[] {
    return this.rows.filter((row) => this.isEmployeeType(row.employmentType));
  }

  get externalRows(): EmployeeControlRow[] {
    return this.rows.filter((row) => this.isExternalType(row.employmentType));
  }

  get employeeCount(): number {
    return this.employeeRows.length;
  }

  get externalCount(): number {
    return this.externalRows.length;
  }

  changeTab(tab: EmployeeTab): void {
    this.activeTab = tab;
  }

  openNewEmployee(): void {
    this.formMode = 'new';
    this.formErrorMessage = '';
    this.employeeForm = this.createEmptyForm();
    this.employeeDetailsForm = this.createEmptyEmployeeDetails();
    this.externalDetailsForm = this.createEmptyExternalDetails();
    this.resetEmployeeDocuments();
    this.selectedContractFile = null;
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
          employmentType: this.normalizeEmploymentType(user.employmentType),
          admissionDate: this.toDateInputValue(user.admissionDate),
          jobpositionId: this.normalizeRoleIds(user.jobpositionId),
        };
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
    request.pipe(
      switchMap((response) => this.resolveSavedUserId(payload, response)),
      switchMap((userId) => this.saveDetailsByEmploymentType(userId, payload))
    ).subscribe({
      next: ({ userId, detailsSaved }) => {
        this.saving = false;
        if (!detailsSaved) {
          this.formMode = 'edit';
          this.employeeForm.id = userId;
          this.employeeForm.password = '';
          this.formErrorMessage = this.isExternalType(payload.employmentType)
            ? 'Colaborador salvo, mas nao foi possivel salvar os dados de PJ/externo. Revise e tente salvar novamente.'
            : 'Colaborador salvo, mas nao foi possivel salvar os dados admissionais. Revise e tente salvar novamente.';
          this.loadEmployees();
          return;
        }

        this.activeTab = this.isExternalType(payload.employmentType) ? 'externos' : 'funcionarios';
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

  get shouldShowEmployeeDetails(): boolean {
    return this.isEmployeeType(this.employeeForm.employmentType);
  }

  get shouldShowExternalDetails(): boolean {
    return this.isExternalType(this.employeeForm.employmentType);
  }

  get basicSectionTitle(): string {
    return this.shouldShowEmployeeDetails
      ? 'Dados do Funcionario'
      : 'Dados da Pessoa Juridica / Colaborador Externo';
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

  onManagerChange(): void {
    this.employeeForm.coordenatorId = undefined;
    this.loadCoordinators(this.employeeForm.managerId);
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
      employmentType: this.normalizeEmploymentType(this.employeeForm.employmentType),
      managerId: this.normalizeOptionalNumber(this.employeeForm.managerId),
      coordenatorId: this.normalizeOptionalNumber(this.employeeForm.coordenatorId),
      gestorId: this.normalizeOptionalNumber(this.employeeForm.gestorId),
    } as Usuarios;

    if (this.formMode === 'edit' && !this.employeeForm.password?.trim()) {
      payload.password = '';
    }

    return payload;
  }

  private buildEmployeeDetailsPayload(userId: number): EmployeeDetails {
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
      password: '',
      cpf: '',
      cellphone: '',
      address: '',
      admissionDate: '',
      hidden: false,
      employmentType: 'FUNCIONARIO',
      jobpositionId: [],
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
    if (!this.isEmployeeType(payload.employmentType)) {
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
    if (this.isEmployeeType(payload.employmentType)) {
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
      return 'Tipo de arquivo invalido. Envie PDF, JPG ou PNG.';
    }

    if (file.size > maxFileSize) {
      return 'Arquivo deve ter no maximo 10 MB.';
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
    if (!email) {
      return throwError(() => new Error('Nao foi possivel identificar o usuario criado.'));
    }

    return this.adminAccessService.listUsersByStatus('all').pipe(
      map((users) => {
        const created = (users ?? []).find((user) => user.email?.trim().toLowerCase() === email);
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
    return {
      ...details,
      rgIssueDate: this.toDateInputValue(details.rgIssueDate),
      birthDate: this.toDateInputValue(details.birthDate),
      ctpsIssueDate: this.toDateInputValue(details.ctpsIssueDate),
    };
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

  private normalizeOptionalInteger(value: unknown): number | null {
    const numberValue = this.normalizeOptionalDecimal(value);
    return numberValue === null ? null : Math.trunc(numberValue);
  }

  private isEmployeeType(value?: string | null): boolean {
    return this.normalizeEmploymentType(value) === 'FUNCIONARIO';
  }

  private isExternalType(value?: string | null): boolean {
    return ['PJ', 'PARCEIRO', 'TERCEIRO', 'CONTADOR', 'DIRETOR', 'OUTRO']
      .includes(this.normalizeEmploymentType(value));
  }

  private toDateInputValue(value?: string | null): string {
    if (!value) {
      return '';
    }

    return value.substring(0, 10);
  }
}
