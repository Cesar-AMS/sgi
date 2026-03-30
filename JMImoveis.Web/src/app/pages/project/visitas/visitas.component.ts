import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { VisitasApiService } from 'src/app/core/services/visitas-api.service';
import { Usuarios } from 'src/app/models/ContaBancaria';
import { Visita, VisitaStatus } from 'src/app/models/visita';
import { exportToExcel } from 'src/app/shared/utils/excel-export';


@Component({
  selector: 'app-visitas',
  templateUrl: './visitas.component.html',
  styleUrl: './visitas.component.scss'
})
export class VisitasComponent {

setStatusTab(status: 'Agendada' | 'Confirmada' | 'Realizada' | 'Cancelada') {
  this.statusFilter = status;

  this.page = 1;

  this.onFilterChange();
}
  visitas: Visita[] = [];
  paged: Visita[] = [];
  totalItems = 0;
  editingId: number | null = null;     // null = criando, number = editando
isSaving = false;


/*  <th>ID</th>
              <th>Cliente</th>
              <th>Data e Hora</th>
              <th>Corretor</th>
              <th>Status</th>
              <th>Compareceu?</th>
              <th>Virou venda?</th>
              <th>Observação</th>
              <th class="text-end">Ações</th>*/

exportExcel(): void {
  const data = (this.paged || []).map(r => ({
    ID: r.id,
    Cliente: r.nomeCliente,
    DtAgendamento: this.toBRDate(r.dataHoraISO),
    Corretor: this.selectNameSale(r.vendedorId),
    Status: r.status,
    Compareceu: r.compareceu === true? 'SIM': 'NÃO',
    VirouVenda: r.virouVenda === true? 'SIM': 'NÃO',
    Observacao: r.observacao
  }));

  exportToExcel(
    `visitas_${this.today()}.xlsx`,
    'Todas',
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

private isoToDatetimeLocal(iso: string): string {
  try {
    const d = new Date(iso);

    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());

    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  } catch {
    return '';
  }
}

  page = 1;
  itemsPerPage = 50;
  perPageOptions = [50, 100, 150];

  // filtros
  nomeTerm = '';
  vendedorFilter = '';
  statusFilter: '' | VisitaStatus = '';
  compareceuFilter: '' | 'sim' | 'nao' = '';
  virouVendaFilter: '' | 'sim' | 'nao' = '';
  dateRange: 'all' | 'today' | 'last7' | 'last30' | 'thisMonth' | 'thisYear' = 'all';

  corretores: Usuarios[] = [];
  statusOptions: VisitaStatus[] = ['Agendada', 'Confirmada', 'Realizada', 'Cancelada'];

  isLoading = false;

  showCreateModal = false;
  createForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private api: ApiService,
    private visitasApi: VisitasApiService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // corretores (igual seu Leads)
    this.api.getCorretores().subscribe({
      next: (data) => (this.corretores = data || []),
      error: () => (this.corretores = [])
    });

     this.statusFilter = 'Agendada';
    this.loadVisitas();
  }

  buildForm(): void {
    this.createForm = this.fb.group({
      nomeCliente: ['', Validators.required],
      dataHora: ['', Validators.required], // datetime-local
      vendedorId: [''],
      status: ['Agendada' as VisitaStatus, Validators.required],
      observacao: [''],
      compareceu: [false, Validators.required],
      virouVenda: [false, Validators.required],
    });
  }

  // ---------- carregamento ----------
 loadVisitas(): void {
  this.isLoading = true;

  const { startAt, finishAt } = this.getDatesFromRange(this.dateRange);

  this.visitasApi.list({
    q: this.nomeTerm || undefined,
    vendedorId: this.vendedorFilter || undefined,
    status: this.statusFilter || undefined,
    compareceu: this.compareceuFilter ? (this.compareceuFilter === 'sim') : undefined,
    virouVenda: this.virouVendaFilter ? (this.virouVendaFilter === 'sim') : undefined,

    // ✅ só envia quando não for "all"
    startAt: this.dateRange === 'all' ? undefined : (startAt || undefined),
    finishAt: this.dateRange === 'all' ? undefined : (finishAt || undefined),
  }).subscribe({
    next: (list) => {
      this.visitas = list || [];
      this.totalItems = this.visitas.length;
      this.page = 1;
      this.applyAndPaginateLocal();
      this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.isLoading = false;
    },
  });
}


  onFilterChange(): void {
    this.loadVisitas();
  }

  // ---------- paginação local ----------
  onPageChanged(event: any): void {
    this.page = event.page;
    this.itemsPerPage = event.itemsPerPage;
    this.applyAndPaginateLocal();
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = Number(value);
    this.page = 1;
    this.applyAndPaginateLocal();
  }

  getStartIndex(): number {
    if (this.totalItems === 0) return 0;
    return (this.page - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.page * this.itemsPerPage, this.totalItems);
  }

  private applyAndPaginateLocal(): void {
    const startIndex = (this.page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paged = this.visitas.slice(startIndex, endIndex);
  }

  // ---------- ações ----------
 openCreateModal(): void {
  this.editingId = null;
  this.showCreateModal = true;

  this.createForm.reset({
    nomeCliente: '',
    dataHora: '',
    vendedorId: '',
    status: 'Agendada',
    observacao: '',
    compareceu: false,
    virouVenda: false
  });
}

openEditModal(v: Visita): void {
  this.editingId = v.id;
  this.showCreateModal = true;

  // ISO -> datetime-local (YYYY-MM-DDTHH:mm)
  const dtLocal = this.isoToDatetimeLocal(v.dataHoraISO);

  this.createForm.reset({
    nomeCliente: v.nomeCliente,
    dataHora: dtLocal,
    vendedorId: v.vendedorId ?? '',
    status: v.status,
    observacao: v.observacao ?? '',
    compareceu: !!v.compareceu,
    virouVenda: !!v.virouVenda
  });
}


  closeCreateModal(): void {
  this.showCreateModal = false;
  this.editingId = null;
  this.isSaving = false;
}


  submitSave(): void {
  if (this.createForm.invalid) {
    this.createForm.markAllAsTouched();
    return;
  }

  const form = this.createForm.value;

  // datetime-local -> ISO
  const iso = new Date(form.dataHora).toISOString();

  const payload = {
    nomeCliente: String(form.nomeCliente || '').trim(),
    dataHoraISO: iso,
    vendedorId: form.vendedorId ? String(form.vendedorId) : null,
    status: form.status,
    observacao: form.observacao || '',
    compareceu: !!form.compareceu,
    virouVenda: !!form.virouVenda,
  };

  this.isSaving = true;

  // ✅ EDITAR
  if (this.editingId) {
    this.visitasApi.update(this.editingId, payload as any).subscribe({
      next: () => {
        this.toast.success('Visita atualizada!');
        this.isSaving = false;
        this.closeCreateModal();
        this.loadVisitas();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Erro ao atualizar visita');
        this.isSaving = false;
      }
    });
    return;
  }

  // ✅ CRIAR
  this.visitasApi.create(payload as any).subscribe({
    next: () => {
      this.toast.success('Visita criada com sucesso!');
      this.isSaving = false;
      this.closeCreateModal();
      this.loadVisitas();
    },
    error: (err) => {
      console.error(err);
      this.toast.error('Erro ao criar visita');
      this.isSaving = false;
    }
  });
}


  updateCompareceu(visita: Visita, value: boolean): void {
    this.visitasApi.update(visita.id, { compareceu: value }).subscribe({
      next: () => this.loadVisitas(),
      error: () => this.toast.error('Erro ao atualizar compareceu')
    });
  }

  updateVirouVenda(visita: Visita, value: boolean): void {
    this.visitasApi.update(visita.id, { virouVenda: value }).subscribe({
      next: () => this.loadVisitas(),
      error: () => this.toast.error('Erro ao atualizar virou venda')
    });
  }

  updateStatus(visita: Visita, value: VisitaStatus): void {
    this.visitasApi.update(visita.id, { status: value }).subscribe({
      next: () => this.loadVisitas(),
      error: () => this.toast.error('Erro ao atualizar status')
    });
  }

  remove(visita: Visita): void {
    this.visitasApi.remove(visita.id).subscribe({
      next: () => {
        this.toast.info('Visita removida');
        this.loadVisitas();
      },
      error: () => this.toast.error('Erro ao remover')
    });
  }

  // ---------- helpers ----------
  selectNameSale(idVendedor: any): string {
    if (idVendedor === null || idVendedor === undefined || String(idVendedor).trim() === '') return '-';
    const x = this.corretores.find(it => it.id?.toString().trim() === idVendedor.toString().trim())?.name;
    return x || '-';
  }

  formatDateShort(iso: string): string {
    try {
      return new Date(iso).toLocaleString('pt-BR');
    } catch {
      return iso;
    }
  }

  deleteEditing(): void {
  if (!this.editingId) return;

  const id = this.editingId;
  this.isSaving = true;

  this.visitasApi.remove(id).subscribe({
    next: () => {
      this.toast.info('Visita excluída');
      this.isSaving = false;
      this.closeCreateModal();
      this.loadVisitas();
    },
    error: (err) => {
      console.error(err);
      this.toast.error('Erro ao excluir');
      this.isSaving = false;
    }
  });
}


  private getDatesFromRange(range: string): { startAt: string | null; finishAt: string | null } {
    const today = new Date();
    let start: Date | null = null;
    let finish: Date | null = null;

    switch (range) {
      case 'today':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        finish = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;

      case 'last7':
        finish = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        start = new Date(finish);
        start.setDate(start.getDate() - 6);
        break;

      case 'last30':
        finish = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        start = new Date(finish);
        start.setDate(start.getDate() - 29);
        break;

      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        finish = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        break;

      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        finish = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
        break;

      case 'all':
      default:
        return { startAt: null, finishAt: null };
    }

    return {
      startAt: start ? start.toISOString() : null,
      finishAt: finish ? finish.toISOString() : null,
    };
  }
}
