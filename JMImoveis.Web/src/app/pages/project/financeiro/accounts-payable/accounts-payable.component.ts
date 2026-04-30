import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AccountsPayableService } from 'src/app/core/services/accounts-payable.service';
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

  // UI state
  loading = false;
  creating = false;
  settling = false;

  activeCard: CardKey | null = null;

  // Data
  rows: AccountsPayableRow[] = [];
  totalItems = 0;

  branches: BranchItem[] = []; // se você não usa, pode deixar vazio
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

  // Cards (mesmo shape do contas a receber)
  cards: PayableCardsDto = {
    projectionTotal: 0, projectionValue: 0,
    openTotal: 0, openValue: 0,
    dueTodayTotal: 0, dueTodayValue: 0,
    dueMonthTotal: 0, dueMonthValue: 0,
    overdueTotal: 0, overdueValue: 0,
    paidMonthTotal: 0, paidMonthValue: 0,
  };

  // Paging
  page = 1;
  pageSize = 50;
  pageSizeOptions = [50, 100, 150];

  // Forms
  form!: FormGroup;

  showCreateModal = false;
  createForm!: FormGroup;

  showSettleModal = false;
  settleForm!: FormGroup;
  selectedRow: AccountsPayableRow | null = null;

  constructor(
    private fb: FormBuilder,
    private apService: AccountsPayableService
  ) { }

  ngOnInit(): void {
    this.buildForms();
    this.loadInitial();
  }

  // ---------- Forms ----------
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

      // "Já foi pago"
      isPaid: [false],
      paidDate: [null],

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
  }

  // ---------- Load ----------
  private loadInitial(): void {
    // Se você tiver endpoint para filiais, carregue aqui.
    // this.loadBranches();

    this.refreshCards();
    this.fetchRows();
  }

  private refreshCards(): void {
    const params = this.buildQueryParams({ includeCard: false, includePaging: false });

    this.apService.getSummary(params).subscribe({
      next: (res: any) => {
        this.cards = res ?? this.cards;
      },
      error: () => {
        // mantém cards zerados
      }
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
      VendaId: r.saleId ?? ''
    }));

    exportToExcel(
      `contas_a_pagar_${this.today()}.xlsx`,
      'Pagar',
      data
    );
  }

  private today(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
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
        error: () => {
          this.rows = [];
          this.totalItems = 0;
        }
      });
  }

  // ---------- Filters / Paging ----------
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
    // ngx-bootstrap pagination emits {page, itemsPerPage}
    this.page = e?.page ?? 1;
    this.fetchRows();
  }

  onCardClick(key: CardKey): void {
    // toggle
    this.activeCard = (this.activeCard === key) ? null : key;
    this.page = 1;
    this.fetchRows();
  }



  exportPdf(): void {
    const params = this.buildQueryParams({ includeCard: true, includePaging: false });
    this.apService.exportPdf(params).subscribe();
  }

  // ---------- Create Modal ----------
  openCreateModal(): void {
    this.showCreateModal = true;

    // defaults
    const today = this.toDateInputValue(new Date());
    this.createForm.patchValue({
      competenceDate: today,
      dueDate: this.defaultDueDateNext05(today),
      isPaid: false,
      paidDate: null,
      status: 'WAITING',
      amount: 0,
      pendingAmount: 0,
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
    const total = Number(this.createForm.value.amount ?? 0);
    const isPaid = !!this.createForm.value.isPaid;

    this.createForm.patchValue({
      pendingAmount: isPaid ? 0 : total
    }, { emitEvent: false });
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

  submitCreate(): void {
    if (this.createForm.invalid) return;

    const v = this.createForm.value;

    const payload = {
      saleId: v.saleId,
      branchId: v.branchId,
      competenceDate: v.competenceDate,
      dueDate: v.dueDate,
      paidDate: v.isPaid ? v.paidDate : null,

      description: (v.description ?? '').trim(),
      status: v.status,
      category: v.category,

      amount: Number(v.amount ?? 0),
      pendingAmount: Number(v.pendingAmount ?? 0),

      observations: v.observations
    };

    this.creating = true;
    this.apService.create(payload)
      .pipe(finalize(() => (this.creating = false)))
      .subscribe({
        next: () => {
          // mantém modal aberto (igual ao receber: "Adicionar e continuar")
          this.createForm.patchValue({
            description: '',
            observations: null,
            saleId: null,
            amount: 0,
            pendingAmount: 0,
            isPaid: false,
            paidDate: null,
            status: 'WAITING',
            competenceDate: this.toDateInputValue(new Date()),
            dueDate: this.defaultDueDateNext05(this.toDateInputValue(new Date()))
          }, { emitEvent: false });

          this.refreshCards();
          this.fetchRows();
        },
        error: () => {
          // opcional: toast
        }
      });
  }

  // ---------- Settle Modal ----------
  openSettleModal(row: AccountsPayableRow): void {
    this.selectedRow = row;
    this.showSettleModal = true;

    const today = this.toDateInputValue(new Date());
    const total = Number(row?.amount ?? 0);
    const pending = Number(row?.pendingAmount ?? total);
    const defaultValue = pending > 0 ? pending : total;

    this.settleForm.reset({
      paid_value: defaultValue,
      paid_date: today,
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
    if (this.settleForm.invalid) return;

    const payload = {
      paidValue: Number(this.settleForm.value.paid_value),
      paidDate: String(this.settleForm.value.paid_date),
      observations: this.settleForm.value.observations
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
        error: () => {
          // opcional: toast
        }
      });
  }

  // ---------- Helpers ----------
  badgeClass(status: StatusType): string {
    switch (status) {
      case 'PROJECAO': return 'badge-projection';
      case 'WAITING': return 'badge-waiting';
      case 'PAID': return 'badge-paid';
      case 'CANCELLED': return 'badge-cancelled';
      default: return '';
    }
  }

  checkStatus(status: StatusType): string {
    switch (status) {
      case 'PROJECAO': return 'PROJEÇÃO';
      case 'WAITING': return 'EM ABERTO';
      case 'PAID': return 'PAGO';
      case 'CANCELLED': return 'CANCELADO';
      default: return status;
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
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

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
          params.dueFrom = this.toDateInputValue(today);
          params.dueTo = this.toDateInputValue(today);
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

  private toDateInputValue(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Próximo dia 05 a partir de uma data (competência/venda).
   * Se a data já for 05 (qualquer mês), vence no dia 05 do próximo mês.
   */
  private defaultDueDateNext05(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const base = new Date(y, (m - 1), d);

    const due = new Date(base.getFullYear(), base.getMonth(), 5);

    // se dia >= 5, joga pro mês seguinte (inclui quando é dia 5)
    if (base.getDate() >= 5) {
      due.setMonth(due.getMonth() + 1);
    }

    return this.toDateInputValue(due);
  }
}
