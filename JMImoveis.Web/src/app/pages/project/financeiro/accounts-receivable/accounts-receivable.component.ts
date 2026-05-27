import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { AdminAccessService } from 'src/app/core/services/admin-access.service';
import { AccountsReceivableService, AccountsReceivableUpdatePayload } from 'src/app/core/services/accounts-receivable.service';
import { Filial } from 'src/app/models/ContaBancaria';
import { exportToExcel } from 'src/app/shared/utils/excel-export';

type ArStatus = 'WAITING' | 'PAID' | 'CANCELLED' | 'PROJECAO';

export interface AccountsReceivableRow {
  id: number;
  saleId?: number | null;
  branchId?: number | null;

  createdAt: string;
  dueDate: string;
  paidDate?: string | null;

  description: string;
  status: ArStatus;
  category: string;

  amount: number;
  pendingAmount: number;

  observations?: string | null;
}

interface PagedResult<T> {
  items: T[];
  total: number;
}

interface SummaryCards {
  projectionTotal: number;
  projectionValue: number;

  openTotal: number;
  openValue: number;

  dueTodayTotal: number;
  dueTodayValue: number;

  dueMonthTotal: number;
  dueMonthValue: number;

  overdueTotal: number;
  overdueValue: number;

  paidMonthTotal: number;
  paidMonthValue: number;
}

@Component({
  selector: 'app-accounts-receivable',
  templateUrl: './accounts-receivable.component.html',
  styleUrls: ['./accounts-receivable.component.scss'],
})
export class AccountsReceivableComponent implements OnInit {

  loading = false;
  activeCard: 'PROJECTION' | 'OPEN' | 'DUE_TODAY' | 'DUE_MONTH' | 'OVERDUE' | 'PAID_MONTH' | null = null;

  form!: FormGroup;

  page = 1;
  pageSize = 50;
  pageSizeOptions = [50, 100, 150];
  totalItems = 0;

  rows: AccountsReceivableRow[] = [];
  cards: SummaryCards = this.emptyCards();

  branches: Filial[] = [];

  categories = [
    { key: 'ATO', label: 'Ato' },
    { key: 'PARCELA', label: 'Parcela' },
    { key: 'INTERMEDIARY', label: 'Intermediária' },
    { key: 'COMISSAO', label: 'Comissão' },
    { key: 'OUTROS', label: 'Outros' },
  ];

  currencyOptions = {
    prefix: '',
    thousands: '.',
    decimal: ',',
    precision: 2,
    allowNegative: false,
  };

  showCreateModal = false;
  showSettleModal = false;
  showEditModal = false;
  showCancelModal = false;

  creating = false;
  settling = false;
  saving = false;
  editing = false;
  cancelling = false;

  selectedRow: AccountsReceivableRow | null = null;
  editingRow: AccountsReceivableRow | null = null;
  cancellingRow: AccountsReceivableRow | null = null;

  createForm = this.fb.group({
    saleId: [null as number | null],
    branchId: [null as number | null],
    competenceDate: [null as string | null],
    dueDate: [null as string | null],
    isPaid: [false],
    paidDate: [null as string | null],
    description: ['', [Validators.required, Validators.maxLength(255)]],
    category: ['', Validators.required],
    status: ['WAITING' as ArStatus, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    pendingAmount: [null as number | null],
    observations: [null as string | null],
  });

  editForm = this.fb.group({
    branchId: [null as number | null],
    dueDate: [null as string | null, Validators.required],
    description: ['', [Validators.required, Validators.maxLength(255)]],
    category: ['', Validators.required],
    status: ['WAITING' as ArStatus, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    pendingAmount: [null as number | null, [Validators.required, Validators.min(0)]],
    observations: [null as string | null],
  });

  settleForm = this.fb.group({
    paid_value: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    paid_date: new FormControl<string | null>(null, [Validators.required]),
    observations: new FormControl<string | null>(null),
  });

  cancelForm = this.fb.group({
    observations: new FormControl<string | null>(null),
  });

  constructor(
    private fb: FormBuilder,
    private arService: AccountsReceivableService,
    private adminAccessService: AdminAccessService
  ) {}

  ngOnInit(): void {
    const todayDate = new Date();
    const first = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const last = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);

    this.adminAccessService.listBranches().subscribe((data) => {
      this.branches = data;
    });

    this.form = this.fb.group({
      dueFrom: [this.toDateInput(first)],
      dueTo: [this.toDateInput(last)],
      branchId: [null],
      category: [null],
      status: [null],
      search: [''],
    });

    this.setupCreateFormWatchers();
    this.fetchAll();
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchAll();
  }

  checkStatus(status: any): string {
    switch (status) {
      case 'PROJECAO':
        return 'Projeção';
      case 'WAITING':
        return 'Em aberto';
      case 'PAID':
        return 'Pago';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return 'Em aberto';
    }
  }

  clearFilters(): void {
    const todayDate = new Date();
    const first = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const last = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);

    this.form.reset({
      dueFrom: this.toDateInput(first),
      dueTo: this.toDateInput(last),
      branchId: null,
      category: null,
      status: null,
      search: '',
    });

    this.activeCard = null;
    this.page = 1;
    this.pageSize = 50;
    this.fetchAll();
  }

  onPageChanged(event: PageChangedEvent): void {
    this.page = event.page;
    this.fetchList();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = Number(size);
    this.page = 1;
    this.fetchList();
  }

  exportPdf(): void {
    const q = this.buildQuery();
    this.loading = true;

    this.arService.exportPdf(q).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, `contas_receber_${this.getTodayFile()}.pdf`);
        this.loading = false;
      },
      error: (e) => {
        this.notifyError('Erro ao exportar PDF.', e);
        this.loading = false;
      },
    });
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
      VendaId: r.saleId ?? '',
    }));

    exportToExcel(
      `contas_a_receber_${this.today()}.xlsx`,
      'Receber',
      data
    );
  }

  badgeClass(status: ArStatus): string {
    if (status === 'PROJECAO') return 'badge-projection';
    if (status === 'PAID') return 'badge-paid';
    if (status === 'CANCELLED') return 'badge-cancelled';
    return 'badge-waiting';
  }

  canEdit(row: AccountsReceivableRow | null): boolean {
    return !!row && (row.status === 'WAITING' || row.status === 'PROJECAO');
  }

  canCancel(row: AccountsReceivableRow | null): boolean {
    return !!row && (row.status === 'WAITING' || row.status === 'PROJECAO');
  }

  canSettle(row: AccountsReceivableRow | null): boolean {
    if (!row) return false;
    if (row.status === 'PAID' || row.status === 'CANCELLED') return false;
    return Number(row.pendingAmount ?? 0) > 0;
  }

  openCreateModal(): void {
    const todayString = this.toDateInput(new Date());

    this.createForm.reset({
      saleId: null,
      branchId: null,
      competenceDate: todayString,
      dueDate: null,
      isPaid: false,
      paidDate: null,
      description: '',
      category: '',
      status: 'WAITING',
      amount: null,
      pendingAmount: null,
      observations: null,
    });

    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onPaidToggle(): void {
    const isPaid = !!this.createForm.value.isPaid;
    const todayString = this.toDateInput(new Date());

    if (isPaid) {
      this.createForm.patchValue({
        status: 'PAID',
        paidDate: this.createForm.value.paidDate ?? todayString,
      });
    } else {
      this.createForm.patchValue({
        status: 'WAITING',
        paidDate: null,
      });
    }

    this.recalcPending();
  }

  onCreateStatusChanged(): void {
    const status = String(this.createForm.value.status || 'WAITING');
    const todayString = this.toDateInput(new Date());

    if (status === 'PAID') {
      this.createForm.patchValue({
        isPaid: true,
        paidDate: this.createForm.value.paidDate ?? todayString,
      }, { emitEvent: false });
    } else {
      this.createForm.patchValue({
        isPaid: false,
        paidDate: null,
      }, { emitEvent: false });
    }

    this.recalcPending();
  }

  onAmountChanged(): void {
    this.recalcPending();
  }

  getCreateAmountPreview(): number {
    return this.toMoneyNumber(this.createForm.value.amount);
  }

  getCreatePendingPreview(): number {
    return this.toMoneyNumber(this.createForm.value.pendingAmount);
  }

  submitCreate(): void {
    if (this.createForm.invalid) return;

    const isPaid = !!this.createForm.value.isPaid;
    const status = (isPaid ? 'PAID' : String(this.createForm.value.status || 'WAITING')) as ArStatus;

    if (status === 'CANCELLED') {
      this.notifyError('Não é permitido criar uma conta a receber diretamente como cancelada.');
      return;
    }

    if (status === 'PAID' && !this.createForm.value.paidDate) {
      this.notifyError('Informe a data do pagamento para criar uma conta já paga.');
      return;
    }

    const amount = this.toMoneyNumber(this.createForm.value.amount);
    const pendingAmount = status === 'PAID' ? 0 : amount;

    const payload = {
      saleId: this.createForm.value.saleId ?? null,
      branchId: this.createForm.value.branchId ?? null,
      competenceDate: this.createForm.value.competenceDate ?? null,
      dueDate: this.createForm.value.dueDate ?? null,
      paidDate: status === 'PAID' ? this.createForm.value.paidDate ?? null : null,
      description: String(this.createForm.value.description || '').trim(),
      status,
      category: String(this.createForm.value.category || '').trim(),
      amount,
      pendingAmount,
      observations: this.trimOrNull(this.createForm.value.observations),
    };

    this.creating = true;

    this.arService.create(payload).subscribe({
      next: () => {
        this.creating = false;
        this.showCreateModal = false;
        this.fetchAll();
      },
      error: (e) => {
        this.notifyError('Erro ao criar conta a receber.', e);
        this.creating = false;
      },
    });
  }

  onCardClick(card: 'PROJECTION' | 'OPEN' | 'DUE_TODAY' | 'DUE_MONTH' | 'OVERDUE' | 'PAID_MONTH'): void {
    this.activeCard = card;

    const todayDate = new Date();
    const monthStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const monthEnd = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);

    const patch: any = {
      status: null,
      dueFrom: null,
      dueTo: null,
    };

    switch (card) {
      case 'PROJECTION':
        patch.status = 'PROJECAO';
        patch.dueFrom = this.toDateInput(monthStart);
        patch.dueTo = this.toDateInput(monthEnd);
        break;

      case 'OPEN':
        patch.status = 'WAITING';
        patch.dueFrom = this.toDateInput(monthStart);
        patch.dueTo = this.toDateInput(monthEnd);
        break;

      case 'DUE_TODAY':
        patch.status = 'WAITING';
        patch.dueFrom = this.toDateInput(todayDate);
        patch.dueTo = this.toDateInput(todayDate);
        break;

      case 'DUE_MONTH':
        patch.status = 'WAITING';
        patch.dueFrom = this.toDateInput(monthStart);
        patch.dueTo = this.toDateInput(monthEnd);
        break;

      case 'OVERDUE': {
        patch.status = 'WAITING';
        const yesterday = new Date(todayDate);
        yesterday.setDate(todayDate.getDate() - 1);
        patch.dueFrom = null;
        patch.dueTo = this.toDateInput(yesterday);
        break;
      }

      case 'PAID_MONTH':
        patch.status = 'PAID';
        patch.dueFrom = this.toDateInput(monthStart);
        patch.dueTo = this.toDateInput(monthEnd);
        break;
    }

    this.form.patchValue(patch);
    this.page = 1;
    this.fetchAll();
  }

  openSettleModal(row: AccountsReceivableRow): void {
    if (!this.canSettle(row)) {
      this.notifyError('Este título não pode ser baixado.');
      return;
    }

    this.selectedRow = row;

    const todayString = this.toDateInput(new Date());
    const pending = Number((row as any).pendingValue ?? (row as any).pendingAmount ?? 0);
    const total = Number((row as any).totalValue ?? (row as any).amount ?? 0);

    this.settleForm.setValue({
      paid_value: pending > 0 ? pending : total,
      paid_date: todayString,
      observations: null,
    });

    this.showSettleModal = true;
  }

  closeSettleModal(): void {
    this.showSettleModal = false;
    this.selectedRow = null;
  }

  confirmSettle(): void {
    if (!this.selectedRow) return;
    if (!this.canSettle(this.selectedRow)) {
      this.notifyError('Este título não pode ser baixado.');
      return;
    }
    if (this.settleForm.invalid) return;

    const paidValue = Number(this.settleForm.controls.paid_value.value ?? 0);
    const paidDate = this.settleForm.controls.paid_date.value;

    if (!paidDate) {
      this.notifyError('Informe a data do pagamento.');
      return;
    }

    const pending = Number((this.selectedRow as any).pendingValue ?? (this.selectedRow as any).pendingAmount ?? 0);

    if (paidValue <= 0) return;
    if (pending > 0 && paidValue > pending) {
      this.notifyError('O valor da baixa não pode ser maior que o valor pendente.');
      return;
    }

    const payload = {
      paidValue,
      paidDate,
      observations: this.settleForm.controls.observations.value ?? null,
    };

    this.settling = true;

    this.arService.settle(this.selectedRow.id, payload).subscribe({
      next: () => {
        this.settling = false;
        this.closeSettleModal();
        this.fetchAll();
      },
      error: (e) => {
        this.notifyError('Erro ao baixar título.', e);
        this.settling = false;
      },
    });
  }

  openEditModal(row: AccountsReceivableRow): void {
    if (!this.canEdit(row)) {
      this.notifyError('Este título não pode ser editado.');
      return;
    }

    this.editing = true;
    this.arService.getById(row.id).subscribe({
      next: (data) => {
        this.editingRow = data;
        this.editForm.reset({
          branchId: data.branchId ?? null,
          dueDate: this.toDateInputValue(data.dueDate),
          description: data.description || '',
          category: data.category || '',
          status: data.status,
          amount: Number(data.amount ?? 0),
          pendingAmount: Number(data.pendingAmount ?? 0),
          observations: data.observations ?? null,
        });
        this.showEditModal = true;
        this.editing = false;
      },
      error: (e) => {
        this.notifyError('Erro ao carregar conta a receber para edição.', e);
        this.editing = false;
      },
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

    const payload: AccountsReceivableUpdatePayload = {
      dueDate: this.editForm.value.dueDate ?? null,
      amount,
      pendingAmount,
      description: String(this.editForm.value.description ?? '').trim(),
      category: String(this.editForm.value.category ?? '').trim(),
      observations: this.trimOrNull(this.editForm.value.observations),
      branchId: this.editForm.value.branchId ?? null,
      status: (this.editForm.value.status ?? 'WAITING') as ArStatus,
    };

    this.saving = true;
    this.arService.update(this.editingRow.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.closeEditModal();
        this.fetchAll();
      },
      error: (e) => {
        this.notifyError('Erro ao salvar conta a receber.', e);
        this.saving = false;
      },
    });
  }

  openCancelModal(row: AccountsReceivableRow): void {
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
      observations: this.trimOrNull(this.cancelForm.controls.observations.value),
    };

    this.cancelling = true;
    this.arService.cancel(this.cancellingRow.id, payload).subscribe({
      next: () => {
        this.cancelling = false;
        this.closeCancelModal();
        this.fetchAll();
      },
      error: (e) => {
        this.notifyError('Erro ao cancelar conta a receber.', e);
        this.cancelling = false;
      },
    });
  }

  private fetchAll(): void {
    this.fetchCards();
    this.fetchList();
  }

  private fetchCards(): void {
    const q = this.buildQuery();
    this.arService.getSummary(q).subscribe({
      next: (cards) => (this.cards = cards),
      error: (e) => console.error('Erro summary', e),
    });
  }

  private fetchList(): void {
    this.loading = true;
    const q = this.buildQuery();

    this.arService.getPaged(q, this.page, this.pageSize).subscribe({
      next: (res: PagedResult<AccountsReceivableRow>) => {
        this.rows = res.items || [];
        this.totalItems = res.total || 0;
        this.loading = false;
      },
      error: (e) => {
        this.notifyError('Erro ao listar contas a receber.', e);
        this.loading = false;
      },
    });
  }

  private buildQuery() {
    const v = this.form.value;

    return {
      dueFrom: v.dueFrom || null,
      dueTo: v.dueTo || null,
      branchId: v.branchId || null,
      category: v.category || null,
      status: v.status || null,
      search: (v.search || '').trim() || null,
    };
  }

  private recalcPending(): void {
    const amount = this.toMoneyNumber(this.createForm.value.amount);
    const status = String(this.createForm.value.status || 'WAITING');
    const nextPending = status === 'PAID' ? 0 : amount;
    const currentPending = this.toMoneyNumber(this.createForm.value.pendingAmount);

    if (currentPending !== nextPending) {
      this.createForm.patchValue({ pendingAmount: nextPending }, { emitEvent: false });
    }
  }

  private setupCreateFormWatchers(): void {
    this.createForm.get('amount')?.valueChanges.subscribe(() => {
      this.recalcPending();
    });

    this.createForm.get('status')?.valueChanges.subscribe(() => {
      this.recalcPending();
    });

    this.createForm.get('isPaid')?.valueChanges.subscribe(() => {
      this.recalcPending();
    });
  }

  private emptyCards(): SummaryCards {
    return {
      projectionTotal: 0, projectionValue: 0,
      openTotal: 0, openValue: 0,
      dueTodayTotal: 0, dueTodayValue: 0,
      dueMonthTotal: 0, dueMonthValue: 0,
      overdueTotal: 0, overdueValue: 0,
      paidMonthTotal: 0, paidMonthValue: 0,
    };
  }

  private toDateInput(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private toDateInputValue(value?: string | null): string | null {
    if (!value) return null;
    return value.substring(0, 10);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private getTodayFile(): string {
    const currentDate = new Date();
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
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

  private trimOrNull(value?: string | null): string | null {
    const text = String(value ?? '').trim();
    return text || null;
  }

  private toMoneyNumber(value: unknown): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

    const raw = String(value ?? '').trim();
    if (!raw) return 0;

    const normalized = raw
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private notifyError(message: string, error?: any): void {
    console.error(message, error);
    alert(message);
  }
}
