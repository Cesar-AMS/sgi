import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { LeadsService } from 'src/app/core/services/leads.service';
import { LeadInterestRegionService } from 'src/app/core/services/lead-interest-region.service';
import { LeadSourceService } from 'src/app/core/services/lead-source.service';
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
  regiaoInteresseFilter = '';
  dateFrom = '';
  dateTo = '';

  nomeTerm = '';
  dateRange = 'last30';

  viewMode: 'list' | 'kanban' = 'list';
  isLoading = false;
  filtersCollapsed = true;

  canEditLeads = false;
  canTransferLeads = false;

  showCreateModal = false;
  showRegiaoInteresseDropdown = false;
  createForm!: FormGroup;
  isTransferMode = false;
  selectedLeadIds = new Set<number>();
  showTransferModal = false;
  isTransferringLeads = false;
  transferErrorMessage = '';
  transferForm!: FormGroup;
  showReturnScheduleModal = false;
  returnScheduleForm!: FormGroup;
  isSavingReturnSchedule = false;
  returnScheduleErrorMessage = '';
  pendingReturnLead?: Lead;
  pendingReturnPreviousEtapa: LeadEtapaAtendimento | null = null;

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

  fonteOptions: string[] = [];
  regiaoInteresseOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private router: Router,
    private leadService: LeadsService,
    private apiService: ApiService,
    private permissionsService: PermissionsService,
    private sessionService: SessionService,
    private leadInterestRegionService: LeadInterestRegionService,
    private leadSourceService: LeadSourceService
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
    this.loadFonteOptions();
    this.loadRegiaoInteresseOptions();

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
      this.canEditLeads = false;
      this.canTransferLeads = false;
      return;
    }

    this.permissionsService.getUserEffectivePermissions(currentUserId).subscribe({
      next: (response: unknown) => {
        const permissions = this.extractPermissionKeys(response);
        this.canEditLeads =
          permissions.includes('atendimento.leads.editar') ||
          permissions.includes('sistema.admin.total');
        this.canTransferLeads =
          permissions.includes('atendimento.leads.transferir') ||
          permissions.includes('sistema.admin.total');
      },
      error: () => {
        this.canEditLeads = false;
        this.canTransferLeads = false;
      },
    });
  }

  private extractPermissionKeys(response: unknown): string[] {
    if (Array.isArray(response)) {
      return response
        .map((item: any) => {
          if (typeof item === 'string') return item;
          return item?.key || item?.permissionKey || item?.permission_key || item?.name || item?.code || '';
        })
        .filter(Boolean);
    }

    const data = response as any;

    if (Array.isArray(data?.permissions)) {
      return data.permissions
        .map((item: any) => {
          if (typeof item === 'string') return item;
          return item?.key || item?.permissionKey || item?.permission_key || item?.name || item?.code || '';
        })
        .filter(Boolean);
    }

    if (Array.isArray(data?.items)) {
      return data.items
        .map((item: any) => {
          if (typeof item === 'string') return item;
          return item?.key || item?.permissionKey || item?.permission_key || item?.name || item?.code || '';
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
      regioesInteresse: [[] as string[]],
      vendedor: [''],
      observacao: [''],
    });

    this.returnScheduleForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      time: ['09:00', Validators.required],
      note: [''],
    });

    this.transferForm = this.fb.group({
      toUserId: ['', Validators.required],
      reason: ['Transferencia manual de leads selecionados.'],
    });
  }

  private loadRegiaoInteresseOptions(): void {
    this.leadInterestRegionService.listActive().subscribe({
      next: (regions) => {
        const seen = new Set<string>();

        this.regiaoInteresseOptions = (regions || [])
          .map((region) => (region.name || '').trim())
          .filter((name) => {
            if (!name) return false;

            const key = name.toLowerCase();
            if (seen.has(key)) return false;

            seen.add(key);
            return true;
          });
      },
      error: () => {
        this.regiaoInteresseOptions = [];
        this.toast.warning('Não foi possível carregar as regiões de interesse cadastradas.');
      },
    });
  }

  private loadFonteOptions(): void {
    this.leadSourceService.listActive().subscribe({
      next: (sources) => {
        const seen = new Set<string>();

        this.fonteOptions = (sources || [])
          .map((source) => (source.name || '').trim())
          .filter((name) => {
            if (!name) return false;

            const key = name.toLowerCase();
            if (seen.has(key)) return false;

            seen.add(key);
            return true;
          });
      },
      error: () => {
        this.fonteOptions = [];
        this.toast.warning('Não foi possível carregar as fontes de origem cadastradas.');
      },
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
        this.syncSelectedLeadIdsWithCurrentLeads();
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

  openLeadSchedule(event: Event, lead: Lead): void {
    event.preventDefault();
    event.stopPropagation();

    this.router.navigate(['/jm/atendimento/agendamento'], {
      queryParams: {
        leadId: lead.id,
        q: lead.nome,
      },
    });
  }

  toggleTransferMode(): void {
    if (!this.canTransferLeads) {
      this.toast.warning('Voce nao tem permissao para transferir leads.');
      return;
    }

    if (this.isTransferMode) {
      this.cancelTransferMode();
      return;
    }

    this.viewMode = 'list';
    this.isTransferMode = true;
    this.transferErrorMessage = '';
  }

  isLeadSelected(leadId: number): boolean {
    return this.selectedLeadIds.has(leadId);
  }

  toggleLeadSelection(leadId: number, event: Event): void {
    event.stopPropagation();

    if (!this.canTransferLeads || !this.isTransferMode) {
      return;
    }

    if (this.selectedLeadIds.has(leadId)) {
      this.selectedLeadIds.delete(leadId);
      return;
    }

    this.selectedLeadIds.add(leadId);
  }

  areAllPagedLeadsSelected(): boolean {
    return this.pagedLeads.length > 0 && this.pagedLeads.every((lead) => this.selectedLeadIds.has(lead.id));
  }

  toggleSelectAllPagedLeads(event: Event): void {
    event.stopPropagation();

    if (!this.canTransferLeads || !this.isTransferMode) {
      return;
    }

    if (this.areAllPagedLeadsSelected()) {
      this.pagedLeads.forEach((lead) => this.selectedLeadIds.delete(lead.id));
      return;
    }

    this.pagedLeads.forEach((lead) => this.selectedLeadIds.add(lead.id));
  }

  openTransferModal(): void {
    if (!this.canTransferLeads) {
      this.toast.warning('Voce nao tem permissao para transferir leads.');
      return;
    }

    if (this.selectedLeadIds.size === 0) {
      this.toast.warning('Selecione ao menos um lead para transferir.');
      return;
    }

    this.transferErrorMessage = '';
    this.transferForm.reset({
      toUserId: '',
      reason: 'Transferencia manual de leads selecionados.',
    });
    this.showTransferModal = true;
  }

  closeTransferModal(): void {
    if (this.isTransferringLeads) {
      return;
    }

    this.showTransferModal = false;
    this.transferErrorMessage = '';
  }

  submitTransferLeads(): void {
    if (!this.canTransferLeads) {
      this.transferErrorMessage = 'Voce nao tem permissao para transferir leads.';
      return;
    }

    if (this.selectedLeadIds.size === 0) {
      this.transferErrorMessage = 'Selecione ao menos um lead para transferir.';
      return;
    }

    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      this.transferErrorMessage = 'Selecione o agente destino.';
      return;
    }

    const toUserId = Number(this.transferForm.get('toUserId')?.value);
    if (!Number.isFinite(toUserId) || toUserId <= 0) {
      this.transferErrorMessage = 'Selecione um agente destino valido.';
      return;
    }

    const reason = String(this.transferForm.get('reason')?.value ?? '').trim();

    this.isTransferringLeads = true;
    this.transferErrorMessage = '';

    this.leadService.bulkTransferLeads({
      leadIds: Array.from(this.selectedLeadIds),
      toUserId,
      reason: reason || null,
    }).subscribe({
      next: (result) => {
        const transferredCount = result.transferredCount || 0;
        this.isTransferringLeads = false;
        this.showTransferModal = false;
        this.cancelTransferMode();
        this.toast.success(
          `${transferredCount} lead${transferredCount === 1 ? '' : 's'} transferido${transferredCount === 1 ? '' : 's'} com sucesso.`
        );
        this.loadLeads();
      },
      error: () => {
        this.isTransferringLeads = false;
        this.transferErrorMessage = 'Nao foi possivel transferir os leads selecionados.';
      },
    });
  }

  setViewMode(mode: 'list' | 'kanban'): void {
    this.viewMode = mode;
    if (mode === 'kanban' && this.isTransferMode) {
      this.cancelTransferMode();
    }
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
    if (!this.canEditLeads) {
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

    if (targetEtapaAtendimento === 'Agendamento de retorno') {
      this.openReturnScheduleModal(lead, previousEtapaAtendimento);
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

  openReturnScheduleModal(lead: Lead, previousEtapaAtendimento: LeadEtapaAtendimento | null): void {
    this.pendingReturnLead = lead;
    this.pendingReturnPreviousEtapa = previousEtapaAtendimento;
    this.returnScheduleErrorMessage = '';
    this.returnScheduleForm.reset({
      date: new Date().toISOString().substring(0, 10),
      time: '09:00',
      note: '',
    });
    this.showReturnScheduleModal = true;
  }

  closeReturnScheduleModal(): void {
    if (this.isSavingReturnSchedule) {
      return;
    }

    if (this.pendingReturnLead) {
      this.pendingReturnLead.etapaAtendimento = this.pendingReturnPreviousEtapa;
      this.updatePagedLeads();
    }

    this.showReturnScheduleModal = false;
    this.returnScheduleErrorMessage = '';
    this.pendingReturnLead = undefined;
    this.pendingReturnPreviousEtapa = null;
  }

  submitReturnSchedule(): void {
    if (!this.canEditLeads) {
      this.returnScheduleErrorMessage = 'Voce nao tem permissao para alterar a etapa do lead.';
      return;
    }

    if (!this.pendingReturnLead?.id) {
      this.returnScheduleErrorMessage = 'Nao foi possivel identificar o lead.';
      return;
    }

    if (this.returnScheduleForm.invalid) {
      this.returnScheduleForm.markAllAsTouched();
      this.returnScheduleErrorMessage = 'Informe a data e o horario do retorno.';
      return;
    }

    const lead = this.pendingReturnLead;
    const currentUserId = this.sessionService.getCurrentUserId();
    if (!currentUserId) {
      this.returnScheduleErrorMessage = 'Nao foi possivel identificar o usuario logado para criar o retorno.';
      return;
    }

    const payload = this.buildReturnSchedulePayload(lead, currentUserId);
    this.isSavingReturnSchedule = true;
    this.returnScheduleErrorMessage = '';

    this.leadService.updateLeadEtapaAtendimento(lead.id, 'Agendamento de retorno').subscribe({
      next: () => {
        this.leadService.createScheduleV3(lead.id, payload).subscribe({
          next: () => {
            lead.etapaAtendimento = 'Agendamento de retorno';
            this.showReturnScheduleModal = false;
            this.isSavingReturnSchedule = false;
            this.pendingReturnLead = undefined;
            this.pendingReturnPreviousEtapa = null;
            this.updatePagedLeads();
            this.toast.success('Retorno agendado com sucesso.');
          },
          error: () => {
            this.restorePendingReturnEtapa();
            this.isSavingReturnSchedule = false;
            this.returnScheduleErrorMessage = 'Nao foi possivel criar o agendamento de retorno.';
          },
        });
      },
      error: () => {
        this.isSavingReturnSchedule = false;
        this.returnScheduleErrorMessage = 'Nao foi possivel atualizar a etapa do lead.';
      },
    });
  }

  private buildReturnSchedulePayload(lead: Lead, vendedorId: number): unknown {
    const { date, time, note } = this.returnScheduleForm.value;
    const iso = new Date(`${date}T${time}:00`).toISOString();
    const noteText = String(note ?? '').trim();

    return {
      leadId: lead.id,
      nomeCliente: lead.nome,
      telefone: lead.telefone || null,
      dataHoraISO: iso,
      vendedorId,
      status: 'Agendada',
      observacao: noteText ? `Retorno do Kanban: ${noteText}` : 'Retorno agendado pelo Kanban.',
      compareceu: false,
      virouVenda: false,
      tipoAgenda: 'contato',
    };
  }

  private restorePendingReturnEtapa(): void {
    const lead = this.pendingReturnLead;
    if (!lead?.id) {
      return;
    }

    this.leadService.updateLeadEtapaAtendimento(
      lead.id,
      this.pendingReturnPreviousEtapa || this.getEffectiveEtapaAtendimento(lead)
    ).subscribe({
      next: () => {
        lead.etapaAtendimento = this.pendingReturnPreviousEtapa;
        this.updatePagedLeads();
      },
      error: () => {
        lead.etapaAtendimento = this.pendingReturnPreviousEtapa;
        this.updatePagedLeads();
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

  private cancelTransferMode(): void {
    this.isTransferMode = false;
    this.selectedLeadIds.clear();
    this.showTransferModal = false;
    this.transferErrorMessage = '';
  }

  private syncSelectedLeadIdsWithCurrentLeads(): void {
    if (this.selectedLeadIds.size === 0) {
      return;
    }

    const currentLeadIds = new Set(this.leads.map((lead) => lead.id));
    Array.from(this.selectedLeadIds).forEach((leadId) => {
      if (!currentLeadIds.has(leadId)) {
        this.selectedLeadIds.delete(leadId);
      }
    });
  }

  selectNameSale(idvendedor: any): string {
    if (idvendedor === null || idvendedor === undefined || idvendedor === '') {
      return '-';
    }

    const raw = String(idvendedor).trim();
    const name = this.corretores.find(
      (it) => it.id.toString().trim() === raw
    )?.name;

    if (name) {
      return name;
    }

    return Number.isFinite(Number(raw)) ? '-' : raw;
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

      const matchesRegiao =
        !this.regiaoInteresseFilter ||
        this.splitRegioesInteresse(lead.imoveisInteresse).some(
          (regiao) => regiao.toLowerCase() === this.regiaoInteresseFilter.toLowerCase()
        );

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
        matchesRegiao &&
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
      regiaoInteresse: this.regiaoInteresseFilter || null,
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
    if (!this.canEditLeads) {
      this.toast.warning('Voce nao tem permissao para criar leads.');
      return;
    }

    this.showCreateModal = true;
    this.showRegiaoInteresseDropdown = false;
    this.createForm.patchValue({
      status: this.createForm.get('status')?.value || 'Novo',
      etapaAtendimento: this.createForm.get('etapaAtendimento')?.value || 'Sem atendimento',
    });
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.showRegiaoInteresseDropdown = false;
    this.createForm.reset({
      status: 'Novo',
      etapaAtendimento: 'Sem atendimento',
      imoveisInteresse: '',
      regioesInteresse: [],
    });
  }

  submitCreate(): void {
    if (!this.canEditLeads) {
      this.toast.warning('Voce nao tem permissao para criar leads.');
      return;
    }

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const { regioesInteresse, ...formValue } = this.createForm.value;
    const payload = {
      ...formValue,
      status: formValue.status || 'Novo',
      etapaAtendimento: formValue.etapaAtendimento || 'Sem atendimento',
      imoveisInteresse: this.serializeRegioesInteresse(regioesInteresse),
    };

    this.leadService.createLead(payload).subscribe({
      next: (response) => {
        this.applyFilters();
        this.closeCreateModal();
        this.loadLeads();
        this.toast.success('Lead criado com sucesso!');

        if (response?.id) {
          this.openLeadDetails(response.id);
        }
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
      Agente: this.selectNameSale(r.vendedor),
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

  getRegiaoInteresseOptionsForValue(value?: string | null): string[] {
    const normalizedValue = (value || '').trim();
    if (!normalizedValue || this.regiaoInteresseOptions.includes(normalizedValue)) {
      return this.regiaoInteresseOptions;
    }

    return [...this.regiaoInteresseOptions, normalizedValue];
  }

  getRegiaoInteresseFilterOptions(): string[] {
    const seen = new Set(this.regiaoInteresseOptions.map((value) => value.toLowerCase()));
    const legacyValues = (this.leads || [])
      .flatMap((lead) => this.splitRegioesInteresse(lead.imoveisInteresse))
      .filter((value) => {
        const key = value.toLowerCase();
        if (seen.has(key)) return false;

        seen.add(key);
        return true;
      })
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    return [...this.regiaoInteresseOptions, ...legacyValues];
  }

  toggleRegiaoInteresseDropdown(): void {
    this.showRegiaoInteresseDropdown = !this.showRegiaoInteresseDropdown;
  }

  getSelectedRegioesInteresse(): string[] {
    const values = this.createForm?.get('regioesInteresse')?.value;
    if (!Array.isArray(values)) {
      return [];
    }

    return this.splitRegioesInteresse(values.join(','));
  }

  getAvailableRegioesInteresse(): string[] {
    const selected = new Set(
      this.getSelectedRegioesInteresse().map((regiao) => regiao.toLowerCase())
    );

    return this.regiaoInteresseOptions.filter(
      (regiao) => !selected.has(regiao.toLowerCase())
    );
  }

  addRegiaoInteresse(regiao: string): void {
    const selected = this.getSelectedRegioesInteresse();
    const normalizedRegion = regiao.trim();

    if (
      normalizedRegion &&
      !selected.some((item) => item.toLowerCase() === normalizedRegion.toLowerCase())
    ) {
      this.createForm.get('regioesInteresse')?.setValue([...selected, normalizedRegion]);
    }

    this.showRegiaoInteresseDropdown = false;
  }

  removeRegiaoInteresse(regiao: string): void {
    const normalizedRegion = regiao.toLowerCase();
    const selected = this.getSelectedRegioesInteresse().filter(
      (item) => item.toLowerCase() !== normalizedRegion
    );

    this.createForm.get('regioesInteresse')?.setValue(selected);
  }

  private splitRegioesInteresse(value?: string | null): string[] {
    const seen = new Set<string>();

    return (value || '')
      .split(',')
      .map((regiao) => regiao.trim())
      .filter((regiao) => {
        const key = regiao.toLowerCase();
        if (!key || seen.has(key)) return false;

        seen.add(key);
        return true;
      });
  }

  private serializeRegioesInteresse(values: unknown): string {
    if (!Array.isArray(values)) {
      return '';
    }

    return this.splitRegioesInteresse(values.join(',')).join(', ');
  }
}
