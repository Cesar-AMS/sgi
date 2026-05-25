import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, filter, forkJoin, of } from 'rxjs';
import { SessionService } from 'src/app/core/session/session.service';
import { ApiService } from 'src/app/core/services/api.service';
import { Permission, PermissionsService } from 'src/app/core/services/permissions.service';
import { VisitasApiService } from 'src/app/core/services/visitas-api.service';
import { Usuarios } from 'src/app/models/ContaBancaria';
import { Visita, VisitaStatus } from 'src/app/models/visita';
import { exportToExcel } from 'src/app/shared/utils/excel-export';

type VisitasScreenMode = 'agendamento' | 'visitas';
type TipoAgenda = 'contato' | 'visita';
type SchedulePayload = {
  leadId?: number | null;
  nomeCliente: string;
  telefone?: string | null;
  dataHoraISO: string;
  vendedorId: string | null;
  status: VisitaStatus;
  observacao: string;
  tipoAgenda: TipoAgenda;
  compareceu?: boolean;
  virouVenda?: boolean;
};

@Component({
  selector: 'app-visitas',
  templateUrl: './visitas.component.html',
  styleUrl: './visitas.component.scss'
})
export class VisitasComponent {
screenMode: VisitasScreenMode = 'visitas';
filtersCollapsed = false;

setStatusTab(status: 'Agendada' | 'Confirmada' | 'Realizada' | 'Cancelada') {
  this.statusFilter = status;

  this.page = 1;

  this.onFilterChange();
}

clearStatusFilter(): void {
  this.statusFilter = '';
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
    LeadId: r.leadId ?? '',
    Cliente: r.nomeCliente,
    Telefone: r.telefone ?? '',
    Interesse: r.imoveisInteresse ?? '',
    Origem: r.fonte ?? '',
    DtAgendamento: this.toBRDate(r.dataHoraISO),
    Vendedor: this.getVendedorNome(r),
    Coordenador: r.coordenadorNome ?? '',
    Gerente: r.gerenteNome ?? '',
    TipoAgenda: r.tipoAgenda ?? this.getDefaultTipoAgenda(),
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
  visibleCorretores: Usuarios[] = [];
  currentUserId: number | null = null;
  canViewAllVisits = false;
  canEditVisits = false;
  sellerFilterMode: 'full' | 'mine' | 'scoped' = 'full';
  statusOptions: VisitaStatus[] = ['Agendada', 'Confirmada', 'Realizada', 'Cancelada'];

  isLoading = false;
  private loadRequestId = 0;

  showCreateModal = false;
  createForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private api: ApiService,
    private visitasApi: VisitasApiService,
    private router: Router,
    private sessionService: SessionService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.applyScreenModeFromUrl();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        const previousMode = this.screenMode;
        this.applyScreenModeFromUrl();

        if (previousMode !== this.screenMode) {
          this.applyDefaultFiltersForMode();
          this.loadVisitas();
        }
      });

    this.buildForm();
    this.currentUserId = this.sessionService.getCurrentUserId();

    forkJoin({
      corretores: this.api.getCorretores().pipe(catchError(() => of([] as Usuarios[]))),
      permissions: this.currentUserId
        ? this.permissionsService.getUserEffectivePermissions(this.currentUserId).pipe(catchError(() => of([] as Permission[])))
        : of([] as Permission[])
    }).subscribe({
      next: ({ corretores, permissions }) => {
        this.corretores = corretores || [];
        const isAdmin = this.hasPermission(permissions, 'sistema.admin.total');
        this.canViewAllVisits = isAdmin;
        this.canEditVisits = isAdmin || this.hasPermission(permissions, 'atendimento.visitas.editar');
        this.applySellerFilterScope();
      },
      error: () => {
        this.corretores = [];
        this.visibleCorretores = [];
        this.canEditVisits = false;
        this.applySellerFilterScope();
      }
    });

    this.applyDefaultFiltersForMode();
    this.loadVisitas();
  }

  private applyScreenModeFromUrl(): void {
    this.screenMode = this.router.url.includes('/atendimento/agendamento')
      ? 'agendamento'
      : 'visitas';
  }

  private applyDefaultFiltersForMode(): void {
    this.page = 1;
    this.nomeTerm = '';
    this.compareceuFilter = '';
    this.virouVendaFilter = '';

    if (this.screenMode === 'agendamento') {
      this.statusFilter = 'Agendada';
      this.dateRange = 'all';
      this.filtersCollapsed = true;
      return;
    }

    this.statusFilter = '';
    this.dateRange = 'today';
    this.filtersCollapsed = false;
  }

  toggleFilters(): void {
    this.filtersCollapsed = !this.filtersCollapsed;
  }

  isAgendamentoMode(): boolean {
    return this.screenMode === 'agendamento';
  }

  isVisitasMode(): boolean {
    return this.screenMode === 'visitas';
  }

  getPageTitle(): string {
    return this.isAgendamentoMode() ? 'Fila de Agendamentos' : 'Controle de Visitas';
  }

  getPageSubtitle(): string {
    return this.isAgendamentoMode()
      ? 'Acompanhe retornos, follow-ups, reuniões e contatos agendados com clientes.'
      : 'Acompanhe clientes previstos para visita, confirmações, comparecimentos e resultados da recepção.';
  }

  getPrimaryActionLabel(): string {
    return this.isAgendamentoMode() ? 'Novo agendamento' : 'Nova visita';
  }

  getSummaryLabel(): string {
    return this.isAgendamentoMode() ? 'Compromissos agendados' : 'Hoje nos filtros';
  }

  getSummaryValue(): number {
    return this.isAgendamentoMode()
      ? this.visitas.filter((visita) => visita.status === 'Agendada' || visita.status === 'Confirmada').length
      : this.getTodayVisitsCount();
  }

  getSummaryNote(): string {
    return this.isAgendamentoMode()
      ? 'Fila operacional para confirmar contatos, acompanhar retornos e cancelar compromissos quando necessário.'
      : 'Acompanhe a chegada dos clientes e marque rapidamente as visitas realizadas.';
  }

  getStatusTabs(): VisitaStatus[] {
    return this.isAgendamentoMode()
      ? ['Agendada', 'Confirmada', 'Cancelada']
      : ['Agendada', 'Confirmada', 'Realizada', 'Cancelada'];
  }

  getStatusOptionsForMode(): VisitaStatus[] {
    return this.isAgendamentoMode()
      ? ['Agendada', 'Confirmada', 'Cancelada']
      : this.statusOptions;
  }

  getStatusTabLabel(status: VisitaStatus): string {
    const labels: Record<VisitaStatus, string> = {
      Agendada: 'Agendadas',
      Confirmada: 'Confirmadas',
      Realizada: 'Realizadas',
      Cancelada: 'Canceladas',
    };

    return labels[status];
  }

  getFilterDescription(): string {
    return this.isAgendamentoMode()
      ? 'Refine os compromissos por cliente, status, equipe e período.'
      : 'Refine as visitas por busca, status, equipe, comparecimento e período.';
  }

  getSearchLabel(): string {
    return this.isAgendamentoMode() ? 'Buscar agendamento' : 'Buscar visita';
  }

  getSearchAriaLabel(): string {
    return this.isAgendamentoMode()
      ? 'Buscar agendamento por cliente'
      : 'Buscar visita por cliente';
  }

  getExportAriaLabel(): string {
    return this.isAgendamentoMode()
      ? 'Exportar agendamentos para Excel'
      : 'Exportar visitas para Excel';
  }

  getCreateAriaLabel(): string {
    return this.isAgendamentoMode()
      ? 'Criar novo agendamento'
      : 'Criar nova visita';
  }

  getStatusAriaLabel(status: VisitaStatus): string {
    return this.isAgendamentoMode()
      ? `Filtrar agendamentos ${this.getStatusTabLabel(status).toLowerCase()}`
      : `Filtrar visitas ${this.getStatusTabLabel(status).toLowerCase()}`;
  }

  getEmptyMessage(): string {
    return this.isAgendamentoMode()
      ? 'Nenhum agendamento encontrado para os filtros selecionados.'
      : 'Nenhuma visita encontrada para os filtros selecionados.';
  }

  getLoadingMessage(): string {
    return this.isAgendamentoMode() ? 'Carregando agendamentos...' : 'Carregando visitas...';
  }

  getModalTitle(): string {
    if (this.editingId) {
      return this.isAgendamentoMode() ? 'Editar agendamento' : 'Editar visita';
    }

    return this.isAgendamentoMode() ? 'Novo agendamento' : 'Nova visita';
  }

  private getDefaultTipoAgenda(): TipoAgenda {
    return this.isAgendamentoMode() ? 'contato' : 'visita';
  }

  private getListTipoAgenda(): TipoAgenda | undefined {
    return this.isVisitasMode() ? 'visita' : undefined;
  }

  canManageCurrentMode(): boolean {
    return this.isAgendamentoMode() || this.canEditVisits;
  }

  private normalizeTipoAgenda(tipoAgenda?: string | null): string {
    return String(tipoAgenda ?? '').trim().toLowerCase();
  }

  private normalizeTipoAgendaForForm(tipoAgenda?: string | null): TipoAgenda {
    return this.normalizeTipoAgenda(tipoAgenda) === 'visita' ? 'visita' : 'contato';
  }

  buildForm(): void {
    this.createForm = this.fb.group({
      nomeCliente: ['', Validators.required],
      leadId: [''],
      telefone: [''],
      dataHora: ['', Validators.required], // datetime-local
      vendedorId: [''],
      status: ['Agendada' as VisitaStatus, Validators.required],
      tipoAgenda: ['contato' as TipoAgenda, Validators.required],
      observacao: [''],
      compareceu: [false, Validators.required],
      virouVenda: [false, Validators.required],
    });
  }

  // ---------- carregamento ----------
 loadVisitas(): void {
  this.isLoading = true;
  const requestId = ++this.loadRequestId;

  const { startAt, finishAt } = this.getDatesFromRange(this.dateRange);
  const q = this.nomeTerm.trim();

  this.visitasApi.list({
    q: q || undefined,
    vendedorId: this.vendedorFilter || undefined,
    status: this.statusFilter || undefined,
    compareceu: this.compareceuFilter ? (this.compareceuFilter === 'sim') : undefined,
    virouVenda: this.virouVendaFilter ? (this.virouVendaFilter === 'sim') : undefined,
    tipoAgenda: this.getListTipoAgenda(),

    // ✅ só envia quando não for "all"
    startAt: this.dateRange === 'all' ? undefined : (startAt || undefined),
    finishAt: this.dateRange === 'all' ? undefined : (finishAt || undefined),
  }).subscribe({
    next: (list) => {
      if (requestId !== this.loadRequestId) {
        return;
      }

      this.visitas = list || [];
      this.totalItems = this.visitas.length;
      this.page = 1;
      this.applyAndPaginateLocal();
      this.isLoading = false;
    },
    error: (err) => {
      if (requestId !== this.loadRequestId) {
        return;
      }

      console.error(err);
      this.isLoading = false;
    },
  });
}


  search(): void {
    this.page = 1;
    this.loadVisitas();
  }

  onFilterChange(): void {
    this.search();
  }

  onSellerFilterChange(): void {
    if (this.sellerFilterMode === 'mine') {
      this.vendedorFilter = this.currentUserId ? String(this.currentUserId) : '';
    }

    this.onFilterChange();
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
  if (!this.ensureCanManageCurrentMode()) {
    return;
  }

  this.editingId = null;
  this.showCreateModal = true;

  this.createForm.reset({
    nomeCliente: '',
    leadId: '',
    telefone: '',
    dataHora: '',
    vendedorId: '',
    status: 'Agendada',
    tipoAgenda: this.getDefaultTipoAgenda(),
    observacao: '',
    compareceu: false,
    virouVenda: false
  });
}

openEditModal(v: Visita): void {
  if (!this.ensureCanManageCurrentMode()) {
    return;
  }

  this.editingId = v.id;
  this.showCreateModal = true;

  // ISO -> datetime-local (YYYY-MM-DDTHH:mm)
  const dtLocal = this.isoToDatetimeLocal(v.dataHoraISO);

  this.createForm.reset({
    nomeCliente: v.nomeCliente,
    leadId: v.leadId ?? '',
    telefone: v.telefone ?? '',
    dataHora: dtLocal,
    vendedorId: v.vendedorId ?? '',
    status: this.getStatusOptionsForMode().includes(v.status) ? v.status : 'Agendada',
    tipoAgenda: this.normalizeTipoAgendaForForm(v.tipoAgenda),
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
  if (!this.ensureCanManageCurrentMode()) {
    return;
  }

  if (this.createForm.invalid) {
    this.createForm.markAllAsTouched();
    return;
  }

  const form = this.createForm.value;
  const payload = this.buildSchedulePayload(form);

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
    if (!this.ensureCanManageCurrentMode()) {
      return;
    }

    this.visitasApi.update(visita.id, { compareceu: value }).subscribe({
      next: () => this.loadVisitas(),
      error: () => this.toast.error('Erro ao atualizar compareceu')
    });
  }

  updateVirouVenda(visita: Visita, value: boolean): void {
    if (!this.ensureCanManageCurrentMode()) {
      return;
    }

    this.visitasApi.update(visita.id, { virouVenda: value }).subscribe({
      next: () => this.loadVisitas(),
      error: () => this.toast.error('Erro ao atualizar virou venda')
    });
  }

  updateStatus(visita: Visita, value: VisitaStatus): void {
    if (!this.ensureCanManageCurrentMode()) {
      return;
    }

    this.visitasApi.update(visita.id, { status: value }).subscribe({
      next: () => this.loadVisitas(),
      error: () => this.toast.error('Erro ao atualizar status')
    });
  }

  markAsRealizada(visita: Visita): void {
    if (!this.ensureCanManageCurrentMode()) {
      return;
    }

    this.updateStatus(visita, 'Realizada');
  }

  confirmAgendamento(visita: Visita): void {
    this.updateStatus(visita, 'Confirmada');
  }

  hasValidLead(visita: Visita): boolean {
    return Number(visita.leadId) > 0;
  }

  openLead(visita: Visita): void {
    if (!this.hasValidLead(visita)) return;
    this.router.navigate(['/jm/atendimento/leads', visita.leadId], {
      queryParams: { from: this.isAgendamentoMode() ? 'agendamento' : 'visitas' },
    });
  }

  cancel(visita: Visita): void {
    if (!this.ensureCanManageCurrentMode()) {
      return;
    }

    this.visitasApi.cancel(visita.id).subscribe({
      next: () => {
        this.toast.info('Visita cancelada');
        this.loadVisitas();
      },
      error: () => this.toast.error('Erro ao cancelar visita')
    });
  }

  // ---------- helpers ----------
  selectNameSale(idVendedor: any): string {
    if (idVendedor === null || idVendedor === undefined || String(idVendedor).trim() === '') return '-';
    const x = this.corretores.find(it => it.id?.toString().trim() === idVendedor.toString().trim())?.name;
    return x || '-';
  }

  getVendedorNome(visita: Visita): string {
    return visita.vendedorNome || this.selectNameSale(visita.vendedorId);
  }

  getSellerFilterLabel(): string {
    return this.sellerFilterMode === 'mine' ? 'Minhas visitas' : 'Vendedor';
  }

  getSellerFilterAriaLabel(): string {
    return this.sellerFilterMode === 'mine'
      ? 'Filtro fixo para minhas visitas'
      : 'Filtrar visitas por vendedor';
  }

  private applySellerFilterScope(): void {
    if (this.canViewAllVisits) {
      this.sellerFilterMode = 'full';
      this.visibleCorretores = this.corretores;
      return;
    }

    const userId = this.currentUserId;
    if (!userId) {
      this.sellerFilterMode = 'mine';
      this.visibleCorretores = [];
      this.vendedorFilter = '';
      return;
    }

    const managesTeam = this.corretores.some((seller) =>
      this.sameId(seller.coordenatorId, userId)
      || this.sameId(seller.managerId, userId)
      || this.sameId(seller.gestorId, userId)
    );

    if (managesTeam) {
      this.sellerFilterMode = 'scoped';
      this.visibleCorretores = this.corretores;
      return;
    }

    const currentSeller = this.corretores.find((seller) => this.sameId(seller.id, userId));
    this.sellerFilterMode = 'mine';
    this.visibleCorretores = currentSeller ? [currentSeller] : [];
    this.vendedorFilter = String(userId);
  }

  private hasPermission(permissions: Permission[], permissionKey: string): boolean {
    return (permissions ?? []).some((permission) =>
      (permission.permissionKey ?? permission.permission_key) === permissionKey
    );
  }

  private ensureCanManageCurrentMode(): boolean {
    if (this.canManageCurrentMode()) {
      return true;
    }

    this.toast.warning('Usuario sem permissao para editar visitas.');
    return false;
  }

  private sameId(left: unknown, right: unknown): boolean {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    return Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber > 0 && leftNumber === rightNumber;
  }

  formatDateShort(iso: string): string {
    try {
      return new Date(iso).toLocaleString('pt-BR');
    } catch {
      return iso;
    }
  }

  formatDateOnly(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('pt-BR');
    } catch {
      return iso;
    }
  }

  formatTimeOnly(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--:--';
    }
  }

  isToday(iso: string): boolean {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return false;

    const today = new Date();
    return date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
  }

  getTodayVisitsCount(): number {
    return this.visitas.filter((visita) => this.isToday(visita.dataHoraISO)).length;
  }

  getStatusClass(status: VisitaStatus): string {
    switch (status) {
      case 'Confirmada':
        return 'status-confirmada';
      case 'Realizada':
        return 'status-realizada';
      case 'Cancelada':
        return 'status-cancelada';
      case 'Agendada':
      default:
        return 'status-agendada';
    }
  }

  cancelEditing(): void {
  if (!this.ensureCanManageCurrentMode()) {
    return;
  }

  if (!this.editingId) return;

  const id = this.editingId;
  this.isSaving = true;

  this.visitasApi.cancel(id).subscribe({
    next: () => {
      this.toast.info('Visita cancelada');
      this.isSaving = false;
      this.closeCreateModal();
      this.loadVisitas();
    },
    error: (err) => {
      console.error(err);
      this.toast.error('Erro ao cancelar visita');
      this.isSaving = false;
    }
  });
}

private buildSchedulePayload(form: any): SchedulePayload {
  const tipoAgenda = this.isVisitasMode()
    ? 'visita'
    : this.normalizeTipoAgendaForForm(form.tipoAgenda);

  const payload: SchedulePayload = {
    leadId: form.leadId ? Number(form.leadId) : null,
    nomeCliente: String(form.nomeCliente || '').trim(),
    telefone: form.telefone ? String(form.telefone).trim() : null,
    dataHoraISO: new Date(form.dataHora).toISOString(),
    vendedorId: form.vendedorId ? String(form.vendedorId) : null,
    status: this.normalizeStatusForMode(form.status),
    observacao: form.observacao || '',
    tipoAgenda,
  };

  if (this.isVisitasMode()) {
    payload.compareceu = !!form.compareceu;
    payload.virouVenda = !!form.virouVenda;
  }

  return payload;
}

private normalizeStatusForMode(status: VisitaStatus): VisitaStatus {
  const allowedStatuses = this.getStatusOptionsForMode();
  return allowedStatuses.includes(status) ? status : 'Agendada';
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
