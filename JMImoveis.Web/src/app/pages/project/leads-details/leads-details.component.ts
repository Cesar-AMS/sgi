import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateLeadActivityRequest, Lead, LeadDocument, LeadStatus, LeadTransferHistory } from 'src/app/models/lead';
import {
  ContactScheduleStatus,
  LeadActivity,
  LeadSchedule,
  LeadScheduleStatus,
  Usuarios,
  VisitScheduleStatus,
} from 'src/app/models/ContaBancaria';
import { ApiService } from 'src/app/core/services/api.service';
import { LeadsService } from 'src/app/core/services/leads.service';
import { Permission, PermissionsService } from 'src/app/core/services/permissions.service';
import { SessionService } from 'src/app/core/session/session.service';
import { LeadAgendaStatusChangeEvent } from './components/lead-agenda-section/lead-agenda-section.component';
import { LeadVisitStatusChangeEvent } from './components/lead-visits-section/lead-visits-section.component';

type LeadSchedulingKind = 'followup' | 'visita' | 'reuniao';
type OperationalInteractionType =
  | 'Ligação realizada'
  | 'Cliente não respondeu'
  | 'Cliente pediu retorno'
  | 'Cliente demonstrou interesse'
  | 'Cliente agendou visita'
  | 'Cliente sem interesse'
  | 'Observação';

@Component({
  selector: 'app-lead-details',
  templateUrl: './leads-details.component.html',
  styleUrls: ['./leads-details.component.scss'],
})
export class LeadDetailsComponent implements OnInit {
  private readonly backRoutes: Record<string, string> = {
    leads: '/jm/atendimento/leads/listagem',
    agendamento: '/jm/atendimento/agendamento',
    visitas: '/jm/atendimento/visitas',
  };

  lead?: Lead;
  isLoading = false;

  activeTab: 'info' | 'docs' | 'postVisit' = 'info';
  isEditing = false;

  infoForm!: FormGroup;
  activityForm!: FormGroup;
  operationalTimelineForm!: FormGroup;
  quickScheduleForm!: FormGroup;
  showSchedulingModal = false;
  isSavingSchedule = false;
  scheduleErrorMessage = '';
  isSavingInteraction = false;
  timelineErrorMessage = '';
  timelineSuccessMessage = '';
  leadDocuments: LeadDocument[] = [];
  documentErrorMessage = '';
  isLoadingDocuments = false;
  isUploadingDocuments = false;
  canEditLeads = false;
  canViewPostVisit = false;
  canEditPostVisit = false;
  canViewTransferHistory = false;
  showTransferHistoryPanel = false;
  isLoadingTransferHistory = false;
  transferHistoryErrorMessage = '';
  transferHistoryItems: LeadTransferHistory[] = [];

  corretores: Usuarios[] = [];

  contactScheduleStatusOptions: { label: string; value: ContactScheduleStatus }[] = [
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Cumprido', value: 'Cumprido' },
    { label: 'Não cumprido', value: 'NaoCumprido' },
  ];

  visitScheduleStatusOptions: { label: string; value: VisitScheduleStatus }[] = [
    { label: 'Agendada', value: 'Agendada' },
    { label: 'Confirmada', value: 'Confirmada' },
    { label: 'Realizada', value: 'Realizada' },
    { label: 'Cancelada', value: 'Cancelada' },
  ];

  statusOptions: LeadStatus[] = [
    'Novo',
    'Em Contato',
    'Em Negociação',
    'Ganhou',
    'Perdeu',
  ];

  operationalInteractionTypes: OperationalInteractionType[] = [
    'Ligação realizada',
    'Cliente não respondeu',
    'Cliente pediu retorno',
    'Cliente demonstrou interesse',
    'Cliente agendou visita',
    'Cliente sem interesse',
    'Observação',
  ];

  private buildScheduleForm(): void {
    this.scheduleForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      time: ['09:00', Validators.required],
      note: [''],
    });
  }
  schedules: LeadSchedule[] = [];
  schedulesVisit: LeadSchedule[] = [];
  scheduleForm!: FormGroup;

  activities: LeadActivity[] = [];
  isAddingActivity = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private leadService: LeadsService,
    private apiService: ApiService,
    private permissionsService: PermissionsService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.buildForms();
    this.buildScheduleForm();
    this.loadLeadPermissions();


    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadLead(id);
      this.loadActivities(id);
      this.loadLeadDocuments(id);
      this.loadSchedules(id, 'visita');
      this.loadSchedules(id, 'contato');
    }

    this.apiService.getCorretores().subscribe((data) => {
      console.log('corretores', data)
      this.corretores = data
    });
  }

  buildForms(): void {
    this.infoForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.email]],
      telefone: [''],
      status: [''],
      origem: [''],
      valor: [null],
      observacao: [''],
      imoveisInteresse: [''],
      vendedor: [''],
      dataCriacao: [''],
      ultimoContato: [''],
    });

    this.activityForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      time: ['09:00', Validators.required],
      description: ['', Validators.required],
    });

    this.operationalTimelineForm = this.fb.group({
      type: ['', Validators.required],
      description: [''],
    });

    this.quickScheduleForm = this.fb.group({
      type: ['followup' as LeadSchedulingKind, Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      time: ['09:00', Validators.required],
      note: [''],
    });
  }

  loadSchedules(leadId: number, typeSchedule: string): void {
    this.leadService.getSchedulesByLead(leadId, typeSchedule).subscribe({
      next: (items) => {

        if (typeSchedule == 'visita') {
          this.schedulesVisit = (items || []).sort(
            (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          ).map((item) => ({
            ...item,
            status: this.normalizeVisitScheduleStatus(item.status),
          }));
        }
        else {

          this.schedules = (items || []).sort(
            (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          );
        }
      },
    });
  }

  saveSchedule(type: 'contato' | 'visita'): void {
    if (!this.ensureCanEditLeads()) return;
    if (!this.lead || this.scheduleForm.invalid) return;

    const { date, time, note } = this.scheduleForm.value;
    const iso = new Date(`${date}T${time}:00`).toISOString();

    const obj = {
      nomeCliente: this.lead.nome,
      dataHoraISO: iso,
      vendedorId: this.lead.vendedor,
      status: type === 'visita' ? 'Agendada' : 'Pendente',
      observacao: note || null,
      compareceu: false,
      virouVenda: false,
      tipoAgenda: type
    }
    this.leadService.createScheduleV3(this.lead.id, obj).subscribe({
      next: () => {
        if (this.lead?.id) {
          this.loadSchedules(this.lead.id, type)
        }
      },
    });
  }

  changeScheduleStatus(item: LeadSchedule, status: LeadScheduleStatus): void {
    if (!this.ensureCanEditLeads()) return;
    if (!this.lead) return;

    const payload = { id: item.id, leadId: this.lead.id, status };

    this.leadService.updateScheduleStatus(this.lead.id, item.id, payload).subscribe({
      next: () => {
        item.status = status;
      },
    });
  }

  handleContactScheduleStatusChange(event: LeadAgendaStatusChangeEvent): void {
    this.changeScheduleStatus(event.schedule, event.status);
  }

  handleVisitScheduleStatusChange(event: LeadVisitStatusChangeEvent): void {
    this.changeScheduleStatus(event.schedule, event.status);
  }

  private normalizeVisitScheduleStatus(status: LeadScheduleStatus): VisitScheduleStatus {
    switch (status) {
      case 'Pendente':
        return 'Agendada';
      case 'Cumprido':
        return 'Realizada';
      case 'NaoCumprido':
        return 'Cancelada';
      case 'Confirmada':
      case 'Realizada':
      case 'Cancelada':
      case 'Agendada':
        return status;
      default:
        return 'Agendada';
    }
  }



  loadLead(id: number): void {
    this.isLoading = true;
    this.leadService.getLeadById(id).subscribe({
      next: (lead) => {
        this.lead = lead;
        this.patchInfoForm(lead);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadActivities(leadId: number): void {
    this.leadService.getActivitiesByLead(leadId).subscribe({
      next: (acts) => {
        // opcional: ordenar desc por data
        this.activities = (acts || []).sort(
          (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
        );
      },
    });
  }

  patchInfoForm(lead: Lead): void {
    this.infoForm.patchValue({
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      status: lead.status,
      origem: lead.fonte,
      valor: lead.valor,
      observacao: lead.observacao,
      imoveisInteresse: lead.imoveisInteresse,
      vendedor: lead.vendedor,
      dataCriacao: lead.dataCriacao ? lead.dataCriacao.substring(0, 10) : '',
      ultimoContato: (lead as any).ultimoContato || '',
    });
  }

  onLeadDocumentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!this.ensureCanEditLeads('documents')) {
      input.value = '';
      return;
    }

    const files = Array.from(input.files || []);

    if (!files.length || !this.lead) {
      return;
    }

    this.documentErrorMessage = '';
    this.isUploadingDocuments = true;

    this.leadService.uploadLeadDocuments(this.lead.id, files).subscribe({
      next: (response) => {
        this.isUploadingDocuments = false;
        this.leadDocuments = (response.data || []).map((document) => ({ ...document, isEditing: false }))
          .concat(
            this.leadDocuments.map((document) => ({
              ...document,
              isEditing: document.isEditing ?? false,
            }))
          );
        input.value = '';
      },
      error: () => {
        this.isUploadingDocuments = false;
        this.documentErrorMessage = 'Não foi possível anexar os documentos. Verifique o tipo e o tamanho dos arquivos.';
        input.value = '';
      },
    });
  }

  loadLeadDocuments(leadId: number): void {
    this.isLoadingDocuments = true;
    this.documentErrorMessage = '';

    this.leadService.getLeadDocuments(leadId).subscribe({
      next: (documents) => {
        this.leadDocuments = (documents || []).map((document) => ({ ...document, isEditing: false }));
        this.isLoadingDocuments = false;
      },
      error: () => {
        this.documentErrorMessage = 'Não foi possível carregar os documentos do lead.';
        this.isLoadingDocuments = false;
      },
    });
  }

  toggleDocumentEdit(document: LeadDocument): void {
    if (!this.ensureCanEditLeads('documents')) return;

    document.isEditing = !document.isEditing;
  }

  saveLeadDocumentMetadata(document: LeadDocument): void {
    if (!this.ensureCanEditLeads('documents')) return;
    if (!this.lead) return;

    this.leadService.updateLeadDocument(this.lead.id, document.id, {
      displayName: document.displayName,
      description: document.description || null,
    }).subscribe({
      next: (updated) => {
        this.leadDocuments = this.leadDocuments.map((item) =>
          item.id === updated.id ? { ...updated, isEditing: false } : item
        );
      },
      error: () => {
        this.documentErrorMessage = 'Não foi possível atualizar o documento.';
      },
    });
  }

  removeLeadDocument(document: LeadDocument): void {
    if (!this.ensureCanEditLeads('documents')) return;
    if (!this.lead) return;

    this.leadService.deleteLeadDocument(this.lead.id, document.id).subscribe({
      next: () => {
        this.leadDocuments = this.leadDocuments.filter((item) => item.id !== document.id);
      },
      error: () => {
        this.documentErrorMessage = 'Não foi possível remover o documento.';
      },
    });
  }

  openLeadDocument(document: LeadDocument): void {
    if (!this.lead) return;

    this.leadService.downloadLeadDocument(this.lead.id, document.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: () => {
        this.documentErrorMessage = 'Não foi possível abrir o documento.';
      },
    });
  }

  getDocumentIcon(document: LeadDocument): string {
    if (document.contentType.startsWith('image/')) return 'bi-file-earmark-image';
    if (document.contentType === 'application/pdf') return 'bi-file-earmark-pdf';
    return 'bi-file-earmark-text';
  }

  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  goBack(): void {
    const origin = this.route.snapshot.queryParamMap.get('from') || 'leads';
    const targetRoute = this.backRoutes[origin] || this.backRoutes['leads'];

    this.router.navigate([targetRoute]);
  }

  setTab(tab: 'info' | 'docs' | 'postVisit'): void {
    if (tab === 'postVisit' && !this.canViewPostVisit) {
      return;
    }

    this.activeTab = tab;
  }

  openLeadScheduling(): void {
    if (!this.ensureCanEditLeads()) return;

    this.scheduleErrorMessage = '';
    this.showSchedulingModal = true;
    this.quickScheduleForm.reset({
      type: 'followup',
      date: new Date().toISOString().substring(0, 10),
      time: '09:00',
      note: '',
    });
  }

  closeLeadScheduling(): void {
    if (this.isSavingSchedule) return;

    this.showSchedulingModal = false;
    this.scheduleErrorMessage = '';
  }

  openTransferHistory(): void {
    if (!this.lead || !this.canViewTransferHistory) {
      return;
    }

    if (this.showTransferHistoryPanel) {
      this.closeTransferHistory();
      return;
    }

    this.showTransferHistoryPanel = true;
    this.loadTransferHistory(this.lead.id);
  }

  closeTransferHistory(): void {
    this.showTransferHistoryPanel = false;
    this.transferHistoryErrorMessage = '';
  }

  loadTransferHistory(leadId: number): void {
    if (!this.canViewTransferHistory) {
      return;
    }

    this.isLoadingTransferHistory = true;
    this.transferHistoryErrorMessage = '';

    this.leadService.getLeadTransferHistory(leadId).subscribe({
      next: (items) => {
        this.transferHistoryItems = items || [];
        this.isLoadingTransferHistory = false;
      },
      error: () => {
        this.transferHistoryItems = [];
        this.isLoadingTransferHistory = false;
        this.transferHistoryErrorMessage = 'Não foi possível carregar o histórico de transferência.';
      },
    });
  }

  hasTransferChange(item: LeadTransferHistory, type: 'seller' | 'coordinator' | 'manager'): boolean {
    if (type === 'seller') {
      return item.previousSellerId !== item.newSellerId;
    }

    if (type === 'coordinator') {
      return item.previousCoordinatorId !== item.newCoordinatorId;
    }

    return item.previousManagerId !== item.newManagerId;
  }

  formatTransferName(name?: string | null, id?: number | null): string {
    if (name && name.trim()) {
      return name;
    }

    if (id) {
      return `ID ${id}`;
    }

    return 'Sem responsável';
  }

  saveOperationalInteraction(): void {
    if (!this.ensureCanEditLeads('timeline')) return;

    if (!this.lead) {
      return;
    }

    this.timelineSuccessMessage = '';
    const type = this.operationalTimelineForm.get('type')?.value as OperationalInteractionType | '';
    const description = String(this.operationalTimelineForm.get('description')?.value ?? '').trim();

    if (!type) {
      this.operationalTimelineForm.get('type')?.markAsTouched();
      this.timelineErrorMessage = 'Selecione o tipo da interação.';
      return;
    }

    if (type === 'Observação' && !description) {
      this.operationalTimelineForm.get('description')?.markAsTouched();
      this.timelineErrorMessage = 'Informe a observação para registrar esta interação.';
      return;
    }

    const payload: CreateLeadActivityRequest = {
      leadId: this.lead.id,
      dateTime: new Date().toISOString(),
      type,
      description: description || type,
    };

    this.isSavingInteraction = true;
    this.timelineErrorMessage = '';

    this.leadService.addActivity(this.lead.id, payload).subscribe({
      next: () => {
        this.isSavingInteraction = false;
        this.timelineSuccessMessage = 'Interação registrada com sucesso.';
        this.clearOperationalInteractionForm();
        this.loadActivities(this.lead?.id ?? 0);
      },
      error: () => {
        this.isSavingInteraction = false;
        this.timelineErrorMessage = 'Não foi possível registrar a interação. Tente novamente.';
      },
    });
  }

  clearOperationalInteractionForm(): void {
    this.operationalTimelineForm.reset({
      type: '',
      description: '',
    });
    this.timelineErrorMessage = '';
  }

  isObservationInteractionSelected(): boolean {
    return this.operationalTimelineForm.get('type')?.value === 'Observação';
  }

  saveQuickSchedule(): void {
    if (!this.ensureCanEditLeads()) return;

    if (!this.lead) {
      return;
    }

    if (this.quickScheduleForm.invalid) {
      this.quickScheduleForm.markAllAsTouched();
      this.scheduleErrorMessage = 'Informe o tipo, a data e o horário do agendamento.';
      return;
    }

    const form = this.quickScheduleForm.value;
    const type = form.type as LeadSchedulingKind;
    const tipoAgenda = this.getTipoAgendaFromSchedulingKind(type);
    const status = 'Agendada';
    const label = this.getSchedulingKindLabel(type);
    const note = String(form.note ?? '').trim();
    const iso = new Date(`${form.date}T${form.time}:00`).toISOString();
    const vendedorId = Number(this.lead.vendedor) || this.sessionService.getCurrentUserId() || 0;

    const payload = {
      nomeCliente: this.lead.nome,
      dataHoraISO: iso,
      vendedorId,
      status,
      observacao: note ? `${label}: ${note}` : label,
      compareceu: false,
      virouVenda: false,
      tipoAgenda,
    };

    this.isSavingSchedule = true;
    this.scheduleErrorMessage = '';

    this.leadService.createScheduleV3(this.lead.id, payload).subscribe({
      next: () => {
        this.isSavingSchedule = false;
        this.showSchedulingModal = false;
        this.quickScheduleForm.reset({
          type: 'followup',
          date: new Date().toISOString().substring(0, 10),
          time: '09:00',
          note: '',
        });
        this.loadSchedules(this.lead?.id ?? 0, tipoAgenda);
      },
      error: () => {
        this.isSavingSchedule = false;
        this.scheduleErrorMessage = 'Não foi possível salvar o agendamento. Confira os dados e tente novamente.';
      },
    });
  }

  private getTipoAgendaFromSchedulingKind(kind: LeadSchedulingKind): 'contato' | 'visita' {
    return kind === 'visita' ? 'visita' : 'contato';
  }

  private getSchedulingKindLabel(kind: LeadSchedulingKind): string {
    const labels: Record<LeadSchedulingKind, string> = {
      followup: 'Retorno / Follow-up',
      visita: 'Visita',
      reuniao: 'Reunião',
    };

    return labels[kind];
  }

  toggleEdit(): void {
    if (!this.canEditLeads) {
      return;
    }

    this.isEditing = !this.isEditing;

    if (!this.isEditing && this.lead) {
      // se cancelar edição, volta valores originais
      this.patchInfoForm(this.lead);
    }
  }

  saveInfo(): void {
    if (!this.ensureCanEditLeads()) return;
    if (!this.lead || this.infoForm.invalid) return;

    const form = this.infoForm.value;
    const updated: Lead = {
      ...this.lead,
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      status: form.status,
      fonte: form.origem,
      valor: form.valor,
      observacao: form.observacao,
      imoveisInteresse: form.imoveisInteresse,
      vendedor: form.vendedor,
    };

    this.leadService.updateLead(updated).subscribe({
      next: () => {
        this.lead = updated;
        this.isEditing = false;
      },
    });
  }

  private loadLeadPermissions(): void {
    const currentUserId = this.sessionService.getCurrentUserId();
    if (!currentUserId) {
      this.canEditLeads = false;
      this.canViewPostVisit = false;
      this.canEditPostVisit = false;
      this.canViewTransferHistory = false;
      if (this.activeTab === 'postVisit') {
        this.activeTab = 'info';
      }
      return;
    }

    this.permissionsService.getUserEffectivePermissions(currentUserId).subscribe({
      next: (permissions) => {
        const permissionKeys = this.extractPermissionKeys(permissions);
        const isAdmin = permissionKeys.has('sistema.admin.total');
        this.canEditLeads =
          permissionKeys.has('atendimento.leads.editar') ||
          isAdmin;
        this.canViewPostVisit =
          permissionKeys.has('atendimento.posvisita.visualizar') ||
          isAdmin;
        this.canEditPostVisit =
          permissionKeys.has('atendimento.posvisita.editar') ||
          isAdmin;
        this.canViewTransferHistory =
          permissionKeys.has('atendimento.leads.transferencias.visualizar') ||
          isAdmin;

        if (!this.canViewTransferHistory) {
          this.showTransferHistoryPanel = false;
          this.transferHistoryItems = [];
        }

        if (!this.canViewPostVisit && this.activeTab === 'postVisit') {
          this.activeTab = 'info';
        }
      },
      error: () => {
        this.canEditLeads = false;
        this.canViewPostVisit = false;
        this.canEditPostVisit = false;
        this.canViewTransferHistory = false;
        this.showTransferHistoryPanel = false;
        this.transferHistoryItems = [];
        if (this.activeTab === 'postVisit') {
          this.activeTab = 'info';
        }
      },
    });
  }

  private extractPermissionKeys(permissions: Permission[]): Set<string> {
    return new Set(
      (permissions || [])
        .map((permission) => permission.permissionKey || permission.permission_key || '')
        .filter((permissionKey) => !!permissionKey)
    );
  }

  private ensureCanEditLeads(context: 'schedule' | 'documents' | 'timeline' = 'schedule'): boolean {
    if (this.canEditLeads) {
      return true;
    }

    const message = 'Voce nao tem permissao para editar leads.';

    if (context === 'documents') {
      this.documentErrorMessage = message;
    } else if (context === 'timeline') {
      this.timelineErrorMessage = message;
    } else {
      this.scheduleErrorMessage = message;
    }

    return false;
  }

  // ações rápidas – por enquanto só console.log, depois integra
  callLead(): void {
    if (!this.lead?.telefone) return;
    window.open(`tel:${this.lead.telefone}`, '_self');
  }

  whatsappLead(): void {
    if (!this.lead?.telefone) return;
    const phone = this.lead.telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}`, '_blank');
  }

  emailLead(): void {
    if (!this.lead?.email) return;
    window.location.href = `mailto:${this.lead.email}`;
  }

  openSaleFlow(): void {
    if (!this.lead) return;

    this.router.navigate(['/jm/vendas/new'], {
      queryParams: {
        leadId: this.lead.id,
        nome: this.lead.nome ?? '',
        telefone: this.lead.telefone ?? '',
        email: this.lead.email ?? '',
        origem: this.lead.fonte ?? '',
        vendedor: this.lead.vendedor ?? '',
      },
    });
  }

  openProposalFlow(): void {
    if (!this.ensureCanEditLeads()) return;
    if (!this.lead?.id) return;

    this.router.navigate(['/jm/vendas/espelho'], {
      queryParams: {
        leadId: this.lead.id,
      },
    });
  }

  // ---- Atividades ----

  startAddActivity(): void {
    if (!this.ensureCanEditLeads('timeline')) return;

    this.isAddingActivity = true;
    this.activityForm.reset({
      date: new Date().toISOString().substring(0, 10),
      time: '09:00',
      description: '',
    });
  }

  cancelAddActivity(): void {
    this.isAddingActivity = false;
  }

  saveActivity(): void {
    if (!this.ensureCanEditLeads('timeline')) return;
    if (!this.lead || this.activityForm.invalid) return;

    const { date, time, description } = this.activityForm.value;
    const iso = new Date(`${date}T${time}:00`).toISOString();

    const payload = {
      leadId: this.lead.id,
      dateTime: iso,
      description: description,
    };

    this.leadService.addActivity(this.lead.id, payload).subscribe({
      next: () => {
        this.isAddingActivity = false;
        this.loadActivities(this.lead?.id ?? 0);
      },
    });
  }
}
