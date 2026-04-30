import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { AdminAccessService } from 'src/app/core/services/admin-access.service';
import { AccountsReceivableService } from 'src/app/core/services/accounts-receivable.service';
import { Filial } from 'src/app/models/ContaBancaria';
import { exportToExcel } from 'src/app/shared/utils/excel-export';

type ArStatus = 'WAITING' | 'PAID' | 'CANCELLED' | 'PROJECAO';

type SettleFormModel = {
  paid_value: FormControl<number | null>;
  paid_date: FormControl<string | null>;
  observations: FormControl<string | null>;
};

export interface AccountsReceivableRow {
  id: number;
  saleId?: number | null;
  branchId?: number | null;

  createdAt: string;     // ISO string
  dueDate: string;       // ISO string (vencimento)
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

  // filtros
  form!: FormGroup;

  // paginação
  page = 1;
  pageSize = 50;
  pageSizeOptions = [50, 100, 150];
  totalItems = 0;

  // dados
  rows: AccountsReceivableRow[] = [];

  // cards
  cards: SummaryCards = this.emptyCards();

  // combos (mock por enquanto)
  branches: Filial[] = [];

  categories = [
    { key: 'ATO', label: 'Ato' },
    { key: 'PARCELA', label: 'Parcela' },
    { key: 'INTERMEDIARY', label: 'Intermediária' },
    { key: 'COMISSAO', label: 'Comissão' },
    { key: 'OUTROS', label: 'Outros' },
  ];

  constructor(
    private fb: FormBuilder,
    private arService: AccountsReceivableService,
    private adminAccessService: AdminAccessService
  ) {}

  ngOnInit(): void {
    const today = this.toDateInput(new Date());

    this.adminAccessService.listBranches().subscribe((data) => {
      this.branches = data;
    });

    this.form = this.fb.group({
      dueFrom: [today],
      dueTo: [today],
      branchId: [null],
      category: [null],
      status: [null],
      search: [''],
    });

    const first = new Date();
    first.setDate(1);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);

    this.form.patchValue({
      dueFrom: this.toDateInput(first),
      dueTo: this.toDateInput(last),
    });

    this.fetchAll();
  }

  // ---------- Ações ----------
  applyFilters(): void {
    this.page = 1;
    this.fetchAll();
  }

  checkStatus(status: any){
  switch (status) {
    case 'PROJECAO':
      return 'Projeção'
      break;

    case 'WAITING':
       return 'Em aberto'
       break;

    case 'PAID':
      return 'Pago'
      break;

    case 'CANCELLED':
      return 'Cancelado'
      break;
  }
  return 'Em aberto'
  }

  clearFilters(): void {
    const first = new Date();
    first.setDate(1);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);

    this.form.reset({
      dueFrom: this.toDateInput(first),
      dueTo: this.toDateInput(last),
      branchId: null,
      category: null,
      status: null,
      search: '',
    });

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

  // ---------- Carregamento ----------
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


exportPdf(): void {
  const q = this.buildQuery();
  this.loading = true;

  this.arService.exportPdf(q).subscribe({
    next: (blob) => {
      this.downloadBlob(blob, `contas_receber_${this.getTodayFile()}.pdf`);
      this.loading = false;
    },
    error: (e) => {
      console.error('Erro export pdf', e);
      this.loading = false;
    }
  });
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
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
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
        console.error('Erro list', e);
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

  // ---------- Helpers ----------
  badgeClass(status: ArStatus): string {
    if (status === 'PROJECAO') return 'badge-projection';
    if (status === 'PAID') return 'badge-paid';
    if (status === 'CANCELLED') return 'badge-cancelled';
    return 'badge-waiting';
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


createForm = this.fb.group({
  saleId: [null as number | null],
  branchId: [null as number | null],

  competenceDate: [null as string | null],
  dueDate: [null as string | null],

  // UI: checkbox “Já foi recebido”
  isPaid: [false],
  paidDate: [null as string | null],

  description: ['', [Validators.required, Validators.maxLength(255)]],
  category: ['', Validators.required],
  status: ['WAITING', Validators.required],

  amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
  pendingAmount: [null as number | null],

  observations: [null as string | null],
});


showCreateModal = false;

openCreateModal(): void {
  const today = this.toDateInput(new Date());

  this.createForm.reset({
    saleId: null,
    branchId: null,
    competenceDate: today,
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
  const today = this.toDateInput(new Date());

  if (isPaid) {
    this.createForm.patchValue({
      status: 'PAID',
      paidDate: this.createForm.value.paidDate ?? today,
    });
  } else {
    this.createForm.patchValue({
      status: 'WAITING',
      paidDate: null,
    });
  }

  this.recalcPending();
}

private recalcPending(): void {
  const amount = Number(this.createForm.value.amount ?? 0);
  const status = String(this.createForm.value.status || 'WAITING');

  if (status === 'PAID') {
    this.createForm.patchValue({ pendingAmount: 0 }, { emitEvent: false });
  } else {
    this.createForm.patchValue({ pendingAmount: amount }, { emitEvent: false });
  }
}


creating = false;

submitCreate(): void {
  if (this.createForm.invalid) return;

  // Normaliza status conforme o checkbox
  const isPaid = !!this.createForm.value.isPaid;
  const status = isPaid ? 'PAID' : String(this.createForm.value.status || 'WAITING');

  const amount = Number(this.createForm.value.amount ?? 0);
  const pendingAmount =
    status === 'PAID' ? 0 : Number(this.createForm.value.pendingAmount ?? amount);

  const payload = {
    saleId: this.createForm.value.saleId,
    branchId: this.createForm.value.branchId,

    competenceDate: this.createForm.value.competenceDate,
    dueDate: this.createForm.value.dueDate,
    paidDate: status === 'PAID' ? this.createForm.value.paidDate : null,

    description: String(this.createForm.value.description || '').trim(),
    status,
    category: String(this.createForm.value.category || '').trim(),

    amount,
    pendingAmount,

    observations: this.createForm.value.observations?.trim?.() || this.createForm.value.observations || null,
  };

  this.creating = true;

  // Ajuste o método do seu service para create(payload)
  this.arService.create(payload).subscribe({
    next: () => {
      this.creating = false;
      this.showCreateModal = false;
      this.fetchAll();
    },
    error: (e) => {
      console.error('Erro ao criar conta a receber', e);
      this.creating = false;
    }
  });
}

onCardClick(card: 'PROJECTION' | 'OPEN' | 'DUE_TODAY' | 'DUE_MONTH' | 'OVERDUE' | 'PAID_MONTH'): void {
  this.activeCard = card;

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // helper para yyyy-MM-dd
  const toDate = (d: Date) => this.toDateInput(d);

  // base: limpa filtros específicos e seta página 1
  const patch: any = {
    status: null,
    dueFrom: null,
    dueTo: null,
  };

  // regras por card (filtros por vencimento/status)
  switch (card) {
    case 'OPEN':
      patch.status = 'WAITING';
      // mantém intervalo do form se o usuário já setou? -> aqui vamos manter o mês atual
      patch.dueFrom = toDate(monthStart);
      patch.dueTo = toDate(monthEnd);
      break;

    case 'DUE_TODAY':
      patch.status = 'WAITING';
      patch.dueFrom = toDate(today);
      patch.dueTo = toDate(today);
      break;

    case 'DUE_MONTH':
      patch.status = 'WAITING';
      patch.dueFrom = toDate(monthStart);
      patch.dueTo = toDate(monthEnd);
      break;

    case 'OVERDUE':
      patch.status = 'WAITING';
      // vencidos: tudo até ontem (sem from)
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      patch.dueFrom = null;
      patch.dueTo = toDate(yesterday);
      break;

    case 'PAID_MONTH':
      // IMPORTANTE: seu backend hoje filtra por due_date.
      // Para "Pago no mês" o summary usa paid_date, mas a lista está por due_date.
      // Então vamos manter o mês no due_date + status PAID (pra bater com a lista).
      patch.status = 'PAID';
      patch.dueFrom = toDate(monthStart);
      patch.dueTo = toDate(monthEnd);
      break;
  }

  this.form.patchValue(patch);
  this.page = 1;
  this.fetchAll();
}


showSettleModal = false;
settling = false;

selectedRow: AccountsReceivableRow | null = null;

settleForm = this.fb.group({
  paid_value: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
  paid_date: new FormControl<string | null>(null, [Validators.required]),
  observations: new FormControl<string | null>(null)
});

openSettleModal(row: AccountsReceivableRow): void {
  this.selectedRow = row;

  const today = this.toDateInput(new Date());
  const pending = Number((row as any).pendingValue ?? (row as any).pendingAmount ?? 0);
  const total = Number((row as any).totalValue ?? (row as any).amount ?? 0);

  this.settleForm.setValue({
    paid_value: pending > 0 ? pending : total,
    paid_date: today,
    observations: null
  });

  this.showSettleModal = true;
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
    `contas_a_receber_${this.today()}.xlsx`,
    'Receber',
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

closeSettleModal(): void {
  this.showSettleModal = false;
  this.selectedRow = null;
}

onAmountChanged(): void {
  this.recalcPending();
}

confirmSettle(): void {
  if (!this.selectedRow) return;
  if (this.settleForm.invalid) return;

  const paidValue = Number(this.settleForm.controls.paid_value.value ?? 0);
  const paidDate = this.settleForm.controls.paid_date.value;

  if (!paidDate) {
    alert('Informe a data do pagamento.');
    return;
  }

  const pending = Number((this.selectedRow as any).pendingValue ?? (this.selectedRow as any).pendingAmount ?? 0);

  if (paidValue <= 0) return;
  if (pending > 0 && paidValue > pending) {
    alert('O valor da baixa não pode ser maior que o valor pendente.');
    return;
  }

  const payload = {
    paidValue,
    paidDate, // agora é string garantida
    observations: this.settleForm.controls.observations.value ?? null
  };

  this.settling = true;

  this.arService.settle(this.selectedRow.id, payload).subscribe({
    next: () => {
      this.settling = false;
      this.closeSettleModal();
      this.fetchAll();
    },
    error: (e) => {
      console.error('Erro ao baixar título', e);
      this.settling = false;
    }
  });
}

}
