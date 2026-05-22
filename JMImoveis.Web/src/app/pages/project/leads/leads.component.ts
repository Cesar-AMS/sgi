import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { LeadsService } from 'src/app/core/services/leads.service';
import { PermissionsService } from 'src/app/core/services/permissions.service';
import { SessionService } from 'src/app/core/session/session.service';
import {
  LeadFilter,
  LeadSchedule,
  LeadScheduleStatus,
  Usuarios,
} from 'src/app/models/ContaBancaria';
import { Lead, LeadEtapaAtendimento, LeadStatus } from 'src/app/models/lead';
import { exportToExcel } from 'src/app/shared/utils/excel-export';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.scss',
})
export class LeadsComponent {
  leads: Lead[] = [];
  pagedLeads: Lead[] = [];
  totalItems = 0;

  page = 1;
  itemsPerPage = 50;
  perPageOptions = [50, 100, 150];

  filteredLeads: Lead[] = [];
  gerentes: Usuarios[] = [];
  coordenatorsAll: Usuarios[] = [];
  corretores: Usuarios[] = [];

  searchTerm = '';
  statusFilter = '';
  vendedorFilter = '';
  coordenadorFilter = '';
  gerenteFilter = '';
  dateFrom = '';
  dateTo = '';

  nomeTerm = '';
  dateRange = 'last30';

  viewMode: 'list' | 'kanban' = 'list';
  isLoading = false;
  filtersCollapsed = true;

  canEditLeadStatus = false;

  showCreateModal = false;
  createForm!: FormGroup;

  schedules: LeadSchedule[] = [];
  scheduleForm!: FormGroup;

  scheduleStatusOptions: { label: string; value: LeadScheduleStatus }[] = [
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Cumprido', value: 'Cumprido' },
    { label: 'Não cumprido', value: 'NaoCumprido' },
  ];

  statusOptions: LeadStatus[] = [
    'Novo',
    'Em Contato',
    'Em Negociação',
    'Ganhou',
    'Perdeu',
  ];

  etapaAtendimentoOptions: LeadEtapaAtendimento[] = [
    'Sem atendimento',
    'Em atendimento',
    'Agendamento de retorno',
    'Visita agendada',
    'Visita concluída',
  ];

  vendedoresMock = ['João', 'Maria', 'Carlos'];
  coordenadoresMock = ['Ana', 'Bruno'];
  gerentesMock = ['Fernanda', 'Ricardo'];

  fontesMock = [
    'Facebook',
    'Instagram',
    'Indicação',
    'Site',
    'Ação de Rua',
    'Placa',
    'TikTok',
    'Listas telefônicas',
  ];

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private router: Router,
    private leadService: LeadsService,
    private apiService: ApiService,
    private permissionsService: PermissionsService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.loadPermissions();

    this.apiService.getGerentes().subscribe((data) => {
      this.gerentes = data;
    });

    this.apiService.getCoordenadores().subscribe((data) => {
      this.coordenatorsAll = data;
    });

    this.apiService.getCorretores().subscribe((data) => {
      this.corretores = data;
    });

    this.buildForm();
    this.loadLeads();
  }

  private loadPermissions(): void {
    const currentUserId = this.sessionService.getCurrentUserId();

    if (!currentUserId) {
      this.canEditLeadStatus = false;
      return;
    }

    this.permissionsService.getUserEffectivePermissions(currentUserId).subscribe({
      next: (response: unknown) => {
        const permissions = this.extractPermissionKeys(response);
        this.canEditLeadStatus = permissions.includes('atendimento.leads.editar');
      },
      error: () => {
        this.canEditLeadStatus = false;
      },
    });
  }

  private extractPermissionKeys(response: unknown): string[] {
    if (Array.isArray(response)) {
      return response
        .map((item: any) => {
          if (typeof item === 'string') return item;
          return item?.key || item?.permissionKey || item?.name || item?.code || '';
        })
        .filter(Boolean);
    }

    const data = response as any;

    if (Array.isArray(data?.permissions)) {
      return data.permissions
        .map((item: any) => {
          if (typeof item === 'string') return item;
          return item?.key || item?.permissionKey || item?.name || item?.code || '';
        })
        .filter(Boolean);
    }

    if (Array.isArray(data?.items)) {
      return data.items
        .map((item: any) => {
          if (typeof item === 'string') return item;
          return item?.key || item?.permissionKey || item?.name || item?.code || '';
        })
        .filter(Boolean);
    }

    return [];
  }

  loadSchedules(leadId: number): void {
    this.leadService.getSchedulesByLead(leadId, 'visitas').subscribe({
      next: (items) => {
        this.schedules = (items || []).sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime()
        );
      },
    });
  }

  getStartIndex(): number {
    if (this.totalItems === 0) return 0;
    return (this.page - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.page * this.itemsPerPage, this.totalItems);
  }

  buildForm(): void {
    this.createForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.email]],
      telefone: [''],
      status: ['Novo', Validators.required],
      etapaAtendimento: ['Sem atendimento'],
      valor: [null],
      fonte: [''],
      imoveisInteresse: [''],
      vendedor: [''],
      observacao: [''],
    });
  }

  loadLeads(): void {
    this.isLoading = true;
    const filter = this.buildFilter();

    this.leadService.getLeads(filter).subscribe({
      next: (data) => {
        this.leads = data || [];
        this.totalItems = this.leads.length;
        this.page = 1;
        this.updatePagedLeads();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  openLeadDetails(id: number): void {
    this.router.navigate(['/jm/atendimento/leads', id], {
      queryParams: { from: 'leads' },
    });
  }

  setViewMode(mode: 'list' | 'kanban'): void {
    this.viewMode = mode;
  }

  toggleFilters(): void {
    this.filtersCollapsed = !this.filtersCollapsed;
  }

  getLeadsByEtapaAtendimento(etapaAtendimento: LeadEtapaAtendimento): Lead[] {
    return this.leads.filter(
      (lead) => this.getEffectiveEtapaAtendimento(lead) === etapaAtendimento
    );
  }

  getEffectiveEtapaAtendimento(lead: Lead): LeadEtapaAtendimento {
    if (lead.etapaAtendimento) {
      return lead.etapaAtendimento;
    }

    return this.getFallbackEtapaAtendimento(lead.status);
  }

  getFallbackEtapaAtendimento(status: LeadStatus): LeadEtapaAtendimento {
    const fallback: Record<LeadStatus, LeadEtapaAtendimento> = {
      Novo: 'Sem atendimento',
      'Em Contato': 'Em atendimento',
      'Em Negociação': 'Em atendimento',
      Ganhou: 'Visita concluída',
      Perdeu: 'Em atendimento',
    };

    return fallback[status] || 'Sem atendimento';
  }

  getKanbanDropListId(etapaAtendimento: LeadEtapaAtendimento): string {
    return `lead-kanban-${etapaAtendimento
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()}`;
  }

  getKanbanConnectedDropLists(): string[] {
    return this.etapaAtendimentoOptions.map((etapa) => this.getKanbanDropListId(etapa));
  }

  onLeadDropped(event: CdkDragDrop<Lead[]>, targetEtapaAtendimento: LeadEtapaAtendimento): void {
    if (!this.canEditLeadStatus) {
      this.toast.warning('Você não tem permissão para alterar a etapa do lead.');
      return;
    }

    const lead = event.item.data as Lead | undefined;

    if (!lead?.id) {
      this.toast.error('Não foi possível identificar o lead movimentado.');
      return;
    }

    const previousEtapaAtendimento = lead.etapaAtendimento ?? null;
    const currentEtapaAtendimento = this.getEffectiveEtapaAtendimento(lead);

    if (currentEtapaAtendimento === targetEtapaAtendimento) {
      return;
    }

    this.leadService.updateLeadEtapaAtendimento(lead.id, targetEtapaAtendimento).subscribe({
      next: () => {
        lead.etapaAtendimento = targetEtapaAtendimento;
        this.updatePagedLeads();
        this.toast.success('Etapa do lead atualizada com sucesso.');
      },
      error: () => {
        lead.etapaAtendimento = previousEtapaAtendimento;
        this.updatePagedLeads();
        this.toast.error('Não foi possível atualizar a etapa do lead.');
      },
    });
  }

  onPageChanged(event: PageChangedEvent): void {
    this.page = event.page;
    this.itemsPerPage = event.itemsPerPage;
    this.updatePagedLeads();
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = Number(value);
    this.page = 1;
    this.updatePagedLeads();
  }

  private updatePagedLeads(): void {
    const startIndex = (this.page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedLeads = this.leads.slice(startIndex, endIndex);
  }

  selectNameSale(idvendedor: any): string {
    if (idvendedor === null || idvendedor === undefined || idvendedor === '') {
      return '-';
    }

    const name = this.corretores.find(
      (it) => it.id.toString().trim() === idvendedor.toString().trim()
    )?.name;

    return name || '-';
  }

  applyFilters(): void {
    this.filteredLeads = this.leads.filter((lead) => {
      const matchesSearch =
        !this.searchTerm ||
        lead.nome.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        !this.statusFilter || lead.status === this.statusFilter;

      const matchesVendedor =
        !this.vendedorFilter || lead.vendedor === this.vendedorFilter;

      const matchesCoord =
        !this.coordenadorFilter || lead.coordenador === this.coordenadorFilter;

      const matchesGer =
        !this.gerenteFilter || lead.gerente === this.gerenteFilter;

      const created = new Date(lead.dataCriacao).getTime();
      const fromOk =
        !this.dateFrom || created >= new Date(this.dateFrom).getTime();
      const toOk = !this.dateTo || created <= new Date(this.dateTo).getTime();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesVendedor &&
        matchesCoord &&
        matchesGer &&
        fromOk &&
        toOk
      );
    });
  }

  private buildFilter(): LeadFilter {
    const { startAt, finishAt } = this.getDatesFromRange(this.dateRange);

    return {
      nome: this.nomeTerm || null,
      status: this.statusFilter || null,
      vendedor: this.vendedorFilter || null,
      coordenador: this.coordenadorFilter || null,
      gerente: this.gerenteFilter || null,
      startAt: startAt,
      finishAt: finishAt,
    };
  }

  private getDatesFromRange(range: string): {
    startAt: string | null;
    finishAt: string | null;
  } {
    const today = new Date();
    let start: Date | null = null;
    let finish: Date | null = null;

    switch (range) {
      case 'today':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        finish = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );
        break;

      case 'last7':
        finish = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );
        start = new Date(finish);
        start.setDate(start.getDate() - 6);
        break;

      case 'last30':
        finish = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );
        start = new Date(finish);
        start.setDate(start.getDate() - 29);
        break;

      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        finish = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59
        );
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

  onFilterChange(): void {
    this.loadLeads();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.createForm.patchValue({
      status: this.createForm.get('status')?.value || 'Novo',
      etapaAtendimento: this.createForm.get('etapaAtendimento')?.value || 'Sem atendimento',
    });
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createForm.reset();
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.createForm.value,
      status: this.createForm.value.status || 'Novo',
      etapaAtendimento: this.createForm.value.etapaAtendimento || 'Sem atendimento',
    };

    this.leadService.createLead(payload).subscribe({
      next: () => {
        this.applyFilters();
        this.closeCreateModal();
        this.loadLeads();
        this.toast.success('Lead criado com sucesso!');
      },
    });
  }

  exportCsv(): void {
    console.log('Exportar CSV');
  }

  exportExcel(): void {
    const data = (this.pagedLeads || []).map((r) => ({
      ID: r.id,
      Criacao: this.toBRDate(r.dataCriacao),
      Vendedor: this.selectNameSale(r.vendedor),
      Status: r.status,
      Gerente: r.gerente,
      Fonte: r.fonte,
      ValorPendente: Number(r.valor ?? 0),
    }));

    exportToExcel(`leads_${this.today()}.xlsx`, 'Leads', data);
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
}
