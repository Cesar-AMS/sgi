import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AccountsPayableService, AccountsPayableUpdatePayload } from 'src/app/core/services/accounts-payable.service';
import { exportToExcel } from 'src/app/shared/utils/excel-export';

type StatusType = 'WAITING' | 'PAID' | 'CANCELLED' | 'PROJECAO';
type CardKey = 'PROJECTION' | 'OPEN' | 'DUE_TODAY' | 'DUE_MONTH' | 'OVERDUE' | 'PAID_MONTH';

export interface BranchItem {
  id: number;
  name: string;
}

export interface CategoryItem {
  key: string;
  label: string;
}

export interface AccountsPayableRow {
  id: number;
  saleId?: number | null;
  branchId?: number | null;

  competenceDate?: string | null;
  dueDate?: string | null;
  paidDate?: string | null;

  description: string;
  status: StatusType;
  category: string;

  amount: number;
  pendingAmount: number;

  observations?: string | null;
  createdAt?: string | null;
}

export interface PayableCardsDto {
  projectionTotal: number; projectionValue: number;
  openTotal: number; openValue: number;
  dueTodayTotal: number; dueTodayValue: number;
  dueMonthTotal: number; dueMonthValue: number;
  overdueTotal: number; overdueValue: number;
  paidMonthTotal: number; paidMonthValue: number;
}

@Component({
  selector: 'app-accounts-payable',
  templateUrl: './accounts-payable.component.html',
  styleUrls: ['./accounts-payable.component.scss']
})
export class AccountsPayableComponent implements OnInit {

  loading = false;
  creating = false;
  settling = false;
  editing = false;
  saving = false;
  cancelling = false;

  activeCard: CardKey | null = null;

  rows: AccountsPayableRow[] = [];
  totalItems = 0;

  branches: BranchItem[] = [];
  categories: CategoryItem[] = [
    { key: 'COMISSAO', label: 'Comissão' },
    { key: 'COMISSAO_CORRETOR', label: 'Comissão Corretor' },
    { key: 'COMISSAO_GERENTE', label: 'Comissão Gerente' },
    { key: 'COMISSAO_COORDENADOR', label: 'Comissão Coordenador' },
    { key: 'COMISSAO_FINANCEIRO', label: 'Comissão Financeiro' },
    { key: 'PESSOAL', label: 'Pessoal' },
    { key: 'RH', label: 'RH' },
    { key: 'DIRETORIA', label: 'Diretoria' },
    { key: 'OUTROS', label: 'Outros' },
  ];

  cards: PayableCardsDto = this.emptyCards();

  page = 1;
  pageSize = 50;
  pageSizeOptions = [50, 100, 150];

  form!: FormGroup;

  showCreateModal = false;
  createForm!: FormGroup;

  showSettleModal = false;
  settleForm!: FormGroup;
  selectedRow: AccountsPayableRow | null = null;

  showEditModal = false;
  editForm!: FormGroup;
  editingRow: AccountsPayableRow | null = null;

  showCancelModal = false;
  cancelForm!: FormGroup;
  cancellingRow: AccountsPayableRow | null = null;

  constructor(
    private fb: FormBuilder,
    private apService: AccountsPayableService
  ) { }

  ngOnInit(): void {
    this.buildForms();
    this.loadInitial();
  }

  private buildForms(): void {
    this.form = this.fb.group({
      dueFrom: [null],
      dueTo: [null],
      branchId: [null],
      category: [null],
      status: [null],
      search: ['']
    });

    this.createForm = this.fb.group({
      saleId: [null],
      branchId: [null],
      competenceDate: [this.toDateInputValue(new Date())],
      dueDate: [null],
      isPaid: [false],
      paidDate: [null],
      description: ['', [Validators.required, Validators.minLength(3)]],
      status: ['WAITING', Validators.required],
      category: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      pendingAmount: [0, [Validators.required, Validators.min(0)]],
      observations: [null],
    });

    this.editForm = this.fb.group({
      branchId: [null],
      dueDate: [null, Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      status: ['WAITING', Validators.required],
      category: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      pendingAmount: [0, [Validators.required, Validators.min(0)]],
      observations: [null],
    });

    this.settleForm = this.fb.group({
      paid_value: [null, [Validators.required, Validators.min(0.01)]],
      paid_date: [null, Validators.required],
      observations: [null],
    });

    this.cancelForm = this.fb.group({
      observations: new FormControl<string | null>(null),
    });
  }

  private loadInitial(): void {
    this.refreshCards();
    this.fetchRows();
  }

  private refreshCards(): void {
    const params = this.buildQueryParams({ includeCard: false, includePaging: false });

    this.apService.getSummary(params).subscribe({
      next: (res: any) => {
        this.cards = res ?? this.cards;
      },
      error: (e) => console.error('Erro ao carregar cards de contas a pagar.', e)
    });
  }

  private fetchRows(): void {
    const params = this.buildQueryParams({ includeCard: true, includePaging: true });

    this.loading = true;
    this.apService.getPaged(params)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          this.rows = res?.items ?? [];
          this.totalItems = res?.total ?? 0;
        },
        error: (e) => {
          console.error('Erro ao listar contas a pagar.', e);
          this.rows = [];
          this.totalItems = 0;
        }
      });
  }

  clearFilters(): void {
    this.form.reset({
      dueFrom: null,
      dueTo: null,
      branchId: null,
      category: null,
      status: null,
      search: ''
    });

    this.activeCard = null;
    this.page = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    this.page = 1;
    this.refreshCards();
    this.fetchRows();
  }

  onPageSizeChange(v: number): void {
    this.pageSize = Number(v);
    this.page = 1;
    this.fetchRows();
  }

  onPageChanged(e: any): void {
    this.page = e?.page ?? 1;
    this.fetchRows();
  }

  onCardClick(key: CardKey): void {
    this.activeCard = (this.activeCard === key) ? null : key;
    this.page = 1;
    this.fetchRows();
  }

  exportExcel(): void {
    const data = (this.rows || []).map(r => ({
      ID: r.id,
      Criacao: this.toBRDate(r.createdAt),
      Vencimento: this.toBRDate(r.dueDate),
      Descricao: r.description,
      Status: this.checkStatus(r.status),
      Categoria: r.category,
      ValorTotal: Number(r.amount ?? 0),
      ValorPendente: Number(r.pendingAmount ?? 0),
      Observacao: r.observations ?? '',
      VendaId: r.saleId ?? ''
    }));

    exportToExcel(
      `contas_a_pagar_${this.today()}.xlsx`,
      'Pagar',
      data
    );
  }

  exportPdf(): void {
    const params = this.buildQueryParams({ includeCard: true, includePaging: false });
    this.apService.exportPdf(params).subscribe({
      error: (e) => this.notifyError('Erro ao exportar PDF.', e)
    });
  }

  openCreateModal(): void {
    const todayString = this.toDateInputValue(new Date());
    this.showCreateModal = true;

    this.createForm.reset({
      saleId: null,
      branchId: null,
      competenceDate: todayString,
      dueDate: this.defaultDueDateNext05(todayString),
      isPaid: false,
      paidDate: null,
      description: '',
      status: 'WAITING',
      category: '',
      amount: 0,
      pendingAmount: 0,
      observations: null
    });
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createForm.reset({
      saleId: null,
      branchId: null,
      competenceDate: this.toDateInputValue(new Date()),
      dueDate: null,
      isPaid: false,
      paidDate: null,
      description: '',
      status: 'WAITING',
      category: '',
      amount: 0,
      pendingAmount: 0,
      observations: null
    });
  }

  onAmountChanged(): void {
    this.recalcCreatePending();
  }

  onPaidToggle(): void {
    const isPaid = !!this.createForm.value.isPaid;
    const total = Number(this.createForm.value.amount ?? 0);

    if (isPaid) {
      this.createForm.patchValue({
        status: 'PAID',
        pendingAmount: 0,
        paidDate: this.createForm.value.paidDate ?? this.toDateInputValue(new Date()),
      }, { emitEvent: false });
    } else {
      this.createForm.patchValue({
        status: 'WAITING',
        pendingAmount: total,
        paidDate: null
      }, { emitEvent: false });
    }
  }

  onCreateStatusChanged(): void {
    const status = String(this.createForm.value.status || 'WAITING');

    if (status === 'PAID') {
      this.createForm.patchValue({
        isPaid: true,
        paidDate: this.createForm.value.paidDate ?? this.toDateInputValue(new Date()),
      }, { emitEvent: false });
    } else {
      this.createForm.patchValue({
        isPaid: false,
        paidDate: null,
      }, { emitEvent: false });
    }

    this.recalcCreatePending();
  }

  submitCreate(): void {
    if (this.createForm.invalid) return;

    const v = this.createForm.value;
    const status = (v.isPaid ? 'PAID' : String(v.status || 'WAITING')) as StatusType;
    const amount = Number(v.amount ?? 0);

    if (status === 'CANCELLED') {
      this.notifyError('Não é permitido criar uma conta a pagar diretamente como cancelada.');
      return;
    }

    if (status === 'PAID' && !v.paidDate) {
      this.notifyError('Informe a data do pagamento para criar uma conta já paga.');
      return;
    }

    const payload = {
      saleId: v.saleId ?? null,
      branchId: v.branchId ?? null,
      competenceDate: v.competenceDate ?? null,
      dueDate: v.dueDate ?? null,
      paidDate: status === 'PAID' ? v.paidDate ?? null : null,
      description: String(v.description ?? '').trim(),
      status,
      category: String(v.category ?? '').trim(),
      amount,
      pendingAmount: status === 'PAID' ? 0 : amount,
      observations: this.trimOrNull(v.observations)
    };

    this.creating = true;
    this.apService.create(payload)
      .pipe(finalize(() => (this.creating = false)))
      .subscribe({
        next: () => {
          this.resetCreateAfterSave();
          this.refreshCards();
          this.fetchRows();
        },
        error: (e) => this.notifyError('Erro ao criar conta a pagar.', e)
      });
  }

  openSettleModal(row: AccountsPayableRow): void {
    if (!this.canSettle(row)) {
      this.notifyError('Este título não pode ser baixado.');
      return;
    }

    this.selectedRow = row;
    this.showSettleModal = true;

    const todayString = this.toDateInputValue(new Date());
    const total = Number(row?.amount ?? 0);
    const pending = Number(row?.pendingAmount ?? total);
    const defaultValue = pending > 0 ? pending : total;

    this.settleForm.reset({
      paid_value: defaultValue,
      paid_date: todayString,
      observations: null
    });
  }

  closeSettleModal(): void {
    this.showSettleModal = false;
    this.selectedRow = null;
    this.settleForm.reset({
      paid_value: null,
      paid_date: null,
      observations: null
    });
  }

  confirmSettle(): void {
    if (!this.selectedRow) return;
    if (!this.canSettle(this.selectedRow)) {
      this.notifyError('Este título não pode ser baixado.');
      return;
    }
    if (this.settleForm.invalid) return;

    const paidValue = Number(this.settleForm.value.paid_value ?? 0);
    const paidDate = this.settleForm.value.paid_date;
    const pending = Number(this.selectedRow.pendingAmount ?? 0);

    if (!paidDate) {
      this.notifyError('Informe a data do pagamento.');
      return;
    }

    if (paidValue <= 0) {
      this.notifyError('O valor da baixa deve ser maior que zero.');
      return;
    }

    if (pending > 0 && paidValue > pending) {
      this.notifyError('O valor da baixa não pode ser maior que o valor pendente.');
      return;
    }

    const payload = {
      paidValue,
      paidDate: String(paidDate),
      observations: this.trimOrNull(this.settleForm.value.observations)
    };

    this.settling = true;
    this.apService.settle(this.selectedRow.id, payload)
      .pipe(finalize(() => (this.settling = false)))
      .subscribe({
        next: () => {
          this.closeSettleModal();
          this.refreshCards();
          this.fetchRows();
        },
        error: (e) => this.notifyError('Erro ao baixar título.', e)
      });
  }

  openEditModal(row: AccountsPayableRow): void {
    if (!this.canEdit(row)) {
      this.notifyError('Este título não pode ser editado.');
      return;
    }

    this.editing = true;
    this.apService.getById(row.id)
      .pipe(finalize(() => (this.editing = false)))
      .subscribe({
        next: (data) => {
          this.editingRow = data;
          this.editForm.reset({
            branchId: data.branchId ?? null,
            dueDate: this.toDateInputString(data.dueDate),
            description: data.description || '',
            status: data.status,
            category: data.category || '',
            amount: Number(data.amount ?? 0),
            pendingAmount: Number(data.pendingAmount ?? 0),
            observations: data.observations ?? null,
          });
          this.showEditModal = true;
        },
        error: (e) => this.notifyError('Erro ao carregar conta a pagar para edição.', e)
      });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingRow = null;
  }

  onEditAmountChanged(): void {
    const amount = Number(this.editForm.value.amount ?? 0);
    const pendingAmount = Number(this.editForm.value.pendingAmount ?? 0);

    if (pendingAmount > amount) {
      this.editForm.patchValue({ pendingAmount: amount }, { emitEvent: false });
    }
  }

  submitEdit(): void {
    if (!this.editingRow) return;
    if (!this.canEdit(this.editingRow)) {
      this.notifyError('Este título não pode ser editado.');
      return;
    }
    if (this.editForm.invalid) return;

    const amount = Number(this.editForm.value.amount ?? 0);
    const pendingAmount = Number(this.editForm.value.pendingAmount ?? 0);

    if (pendingAmount > amount) {
      this.notifyError('O valor pendente não pode ser maior que o valor total.');
      return;
    }

    const payload: AccountsPayableUpdatePayload = {
      dueDate: this.editForm.value.dueDate ?? null,
      amount,
      pendingAmount,
      description: String(this.editForm.value.description ?? '').trim(),
      category: String(this.editForm.value.category ?? '').trim(),
      observations: this.trimOrNull(this.editForm.value.observations),
      branchId: this.editForm.value.branchId ?? null,
      status: (this.editForm.value.status ?? 'WAITING') as StatusType,
    };

    this.saving = true;
    this.apService.update(this.editingRow.id, payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.refreshCards();
          this.fetchRows();
        },
        error: (e) => this.notifyError('Erro ao salvar conta a pagar.', e)
      });
  }

  openCancelModal(row: AccountsPayableRow): void {
    if (!this.canCancel(row)) {
      this.notifyError('Este título não pode ser cancelado.');
      return;
    }

    this.cancellingRow = row;
    this.cancelForm.reset({ observations: null });
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancellingRow = null;
  }

  confirmCancel(): void {
    if (!this.cancellingRow) return;
    if (!this.canCancel(this.cancellingRow)) {
      this.notifyError('Este título não pode ser cancelado.');
      return;
    }

    const payload = {
      observations: this.trimOrNull(this.cancelForm.controls['observations'].value)
    };

    this.cancelling = true;
    this.apService.cancel(this.cancellingRow.id, payload)
      .pipe(finalize(() => (this.cancelling = false)))
      .subscribe({
        next: () => {
          this.closeCancelModal();
          this.refreshCards();
          this.fetchRows();
        },
        error: (e) => this.notifyError('Erro ao cancelar conta a pagar.', e)
      });
  }

  canSettle(row: AccountsPayableRow | null): boolean {
    if (!row) return false;
    if (row.status === 'PAID' || row.status === 'CANCELLED') return false;
    return Number(row.pendingAmount ?? 0) > 0;
  }

  canEdit(row: AccountsPayableRow | null): boolean {
    return !!row && (row.status === 'WAITING' || row.status === 'PROJECAO');
  }

  canCancel(row: AccountsPayableRow | null): boolean {
    return !!row && (row.status === 'WAITING' || row.status === 'PROJECAO');
  }

  badgeClass(status: StatusType): string {
    switch (status) {
      case 'PROJECAO': return 'badge-projection';
      case 'WAITING': return 'badge-waiting';
      case 'PAID': return 'badge-paid';
      case 'CANCELLED': return 'badge-cancelled';
      default: return '';
    }
  }

  checkStatus(status: StatusType | null | undefined): string {
    switch (status) {
      case 'PROJECAO': return 'Projeção';
      case 'WAITING': return 'Em aberto';
      case 'PAID': return 'Pago';
      case 'CANCELLED': return 'Cancelado';
      default: return 'Em aberto';
    }
  }

  private buildQueryParams(opts: { includeCard: boolean; includePaging: boolean }): any {
    const f = this.form.value;

    const params: any = {
      dueFrom: f.dueFrom || null,
      dueTo: f.dueTo || null,
      branchId: f.branchId ?? null,
      category: f.category ?? null,
      status: f.status ?? null,
      search: (f.search ?? '').trim() || null,
    };

    if (opts.includeCard && this.activeCard) {
      const todayDate = new Date();
      const monthStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
      const monthEnd = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
      const yesterday = new Date(todayDate);
      yesterday.setDate(todayDate.getDate() - 1);

      switch (this.activeCard) {
        case 'PROJECTION':
          params.status = 'PROJECAO';
          params.dueFrom = null;
          params.dueTo = null;
          break;
        case 'OPEN':
          params.status = 'WAITING';
          break;
        case 'DUE_TODAY':
          params.status = 'WAITING';
          params.dueFrom = this.toDateInputValue(todayDate);
          params.dueTo = this.toDateInputValue(todayDate);
          break;
        case 'DUE_MONTH':
          params.status = 'WAITING';
          params.dueFrom = this.toDateInputValue(monthStart);
          params.dueTo = this.toDateInputValue(monthEnd);
          break;
        case 'OVERDUE':
          params.status = 'WAITING';
          params.dueFrom = null;
          params.dueTo = this.toDateInputValue(yesterday);
          break;
        case 'PAID_MONTH':
          params.status = 'PAID';
          params.dueFrom = this.toDateInputValue(monthStart);
          params.dueTo = this.toDateInputValue(monthEnd);
          break;
      }
    }

    if (opts.includePaging) {
      params.page = this.page;
      params.pageSize = this.pageSize;
    }

    return params;
  }

  private resetCreateAfterSave(): void {
    const todayString = this.toDateInputValue(new Date());

    this.createForm.patchValue({
      description: '',
      observations: null,
      saleId: null,
      amount: 0,
      pendingAmount: 0,
      isPaid: false,
      paidDate: null,
      status: 'WAITING',
      competenceDate: todayString,
      dueDate: this.defaultDueDateNext05(todayString)
    }, { emitEvent: false });
  }

  private recalcCreatePending(): void {
    const total = Number(this.createForm.value.amount ?? 0);
    const status = String(this.createForm.value.status || 'WAITING');

    this.createForm.patchValue({
      pendingAmount: status === 'PAID' ? 0 : total
    }, { emitEvent: false });
  }

  private emptyCards(): PayableCardsDto {
    return {
      projectionTotal: 0, projectionValue: 0,
      openTotal: 0, openValue: 0,
      dueTodayTotal: 0, dueTodayValue: 0,
      dueMonthTotal: 0, dueMonthValue: 0,
      overdueTotal: 0, overdueValue: 0,
      paidMonthTotal: 0, paidMonthValue: 0,
    };
  }

  private today(): string {
    const currentDate = new Date();
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private toBRDate(value?: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  }

  private toDateInputValue(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private toDateInputString(value?: string | null): string | null {
    if (!value) return null;
    return value.substring(0, 10);
  }

  private defaultDueDateNext05(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const base = new Date(y, (m - 1), d);

    const due = new Date(base.getFullYear(), base.getMonth(), 5);

    if (base.getDate() >= 5) {
      due.setMonth(due.getMonth() + 1);
    }

    return this.toDateInputValue(due);
  }

  private trimOrNull(value?: string | null): string | null {
    const text = String(value ?? '').trim();
    return text || null;
  }

  private notifyError(message: string, error?: any): void {
    console.error(message, error);
    alert(message);
  }
}
