import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { LeadPostVisitService } from 'src/app/core/services/lead-post-visit.service';
import {
  LeadPostVisitListItem,
  LeadPostVisitStatus,
} from 'src/app/models/lead-post-visit';
import { Usuarios } from 'src/app/models/ContaBancaria';
import { exportToExcel } from 'src/app/shared/utils/excel-export';

type StatusOption = {
  label: string;
  value: LeadPostVisitStatus | '';
};

@Component({
  selector: 'app-pos-visita',
  templateUrl: './pos-visita.component.html',
  styleUrls: ['./pos-visita.component.scss'],
})
export class PosVisitaComponent implements OnInit {
  isLoading = false;
  isLoadingAgents = false;
  errorMessage = '';
  agentsErrorMessage = '';
  exportMessage = '';

  search = '';
  status: LeadPostVisitStatus | '' = '';
  agentId = '';
  followUpFrom = '';
  followUpTo = '';

  postVisits: LeadPostVisitListItem[] = [];
  agents: Usuarios[] = [];

  readonly statusOptions: StatusOption[] = [
    { label: 'Todos os status', value: '' },
    { label: 'Agendou retorno', value: 'AGENDOU_RETORNO' },
    { label: 'Oportunidade futura', value: 'OPORTUNIDADE_FUTURA' },
    { label: 'Acompanhando', value: 'ACOMPANHANDO' },
    { label: 'Em proposta', value: 'EM_PROPOSTA' },
    { label: 'Fechou venda', value: 'FECHOU_VENDA' },
  ];

  constructor(
    private leadPostVisitService: LeadPostVisitService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAgents();
    this.loadPostVisits();
  }

  loadPostVisits(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.exportMessage = '';

    this.leadPostVisitService
      .list({
        search: this.search.trim() || null,
        status: this.status || null,
        agentId: this.agentId || null,
        followUpFrom: this.toStartOfDay(this.followUpFrom),
        followUpTo: this.toEndOfDay(this.followUpTo),
      })
      .pipe(
        catchError(() => {
          this.errorMessage = 'Nao foi possivel carregar os registros de pos-visita.';
          return of([] as LeadPostVisitListItem[]);
        })
      )
      .subscribe((items) => {
        this.postVisits = items || [];
        this.isLoading = false;
      });
  }

  onFilterChange(): void {
    this.loadPostVisits();
  }

  clearFilters(): void {
    this.search = '';
    this.status = '';
    this.agentId = '';
    this.followUpFrom = '';
    this.followUpTo = '';
    this.loadPostVisits();
  }

  exportExcel(): void {
    this.exportMessage = '';

    if (!this.postVisits.length) {
      this.exportMessage = 'Nenhum registro de pos-visita para exportar.';
      return;
    }

    const data = this.postVisits.map((item) => ({
      Cliente: item.nomeCliente || 'Nao informado',
      Telefone: item.telefone || 'Nao informado',
      Email: item.email || '',
      CPF: this.formatCpf(item.cpf),
      'Status Pós-Visita': this.getStatusLabel(item.postVisitStatus),
      'Tipo de renda': this.getIncomeTypeLabel((item as any).incomeType),
      'Região de Interesse': item.interestRegion || 'Nao informado',
      'Valor de entrada': this.formatCurrency(item.downPaymentAmount),
      'Agente que atendeu': item.attendingAgentName || 'Nao informado',
      'Interesse imóvel': this.getPropertyInterestLabel(item.propertyInterestType),
      'Próximo follow-up': this.formatDateTime(item.nextFollowUpAt, 'Nao programado'),
      'Última interação': item.lastInteractionSummary || 'Sem resumo registrado',
      'Proposta vinculada': item.proposalId ? `Proposta #${item.proposalId}` : 'Nao',
      'Data de criação': this.formatDateTime(item.createdAt),
      'Data de atualização': this.formatDateTime(item.updatedAt),
      LeadId: item.leadId,
    }));

    exportToExcel(`pos_visita_${this.today()}.xlsx`, 'Pos-Visita', data);
  }

  openLeadPanel(leadId: number): void {
    if (!leadId) {
      return;
    }

    this.router.navigate(['/jm/atendimento/leads', leadId], {
      queryParams: { from: 'pos-visita' },
    });
  }

  trackByPostVisitId(_: number, item: LeadPostVisitListItem): number {
    return item.postVisitId;
  }

  trackByStatus(_: number, option: StatusOption): string {
    return option.value || 'all';
  }

  trackByAgent(_: number, agent: Usuarios): number {
    return Number(agent.id) || 0;
  }

  getStatusLabel(status: string | null | undefined): string {
    return this.statusOptions.find((option) => option.value === status)?.label || 'Nao informado';
  }

  getPropertyInterestLabel(value: string | null | undefined): string {
    switch ((value || '').toUpperCase()) {
      case 'PRONTO':
        return 'Pronto';
      case 'PLANTA':
        return 'Planta';
      case 'AMBOS':
        return 'Pronto e planta';
      case 'INDEFINIDO':
        return 'Indefinido';
      default:
        return 'Nao informado';
    }
  }

  formatCpf(value?: string | null): string {
    const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11);

    if (!digits) return 'Nao informado';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  private getIncomeTypeLabel(value: string | null | undefined): string {
    switch ((value || '').toUpperCase()) {
      case 'CLT':
        return 'CLT';
      case 'AUTONOMO':
        return 'Autonomo';
      case 'CLT_AUTONOMO':
        return 'CLT + Autônomo';
      case 'EMPRESARIO':
        return 'Empresario';
      case 'APOSENTADO':
        return 'Aposentado';
      case 'INFORMAL':
        return 'Informal';
      default:
        return value || 'Nao informado';
    }
  }

  private formatCurrency(value?: number | null): string {
    if (value === null || value === undefined) {
      return 'Nao informado';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  }

  private formatDateTime(value?: string | null, fallback = ''): string {
    if (!value) {
      return fallback;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private today(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  hasActiveFilters(): boolean {
    return Boolean(this.search || this.status || this.agentId || this.followUpFrom || this.followUpTo);
  }

  private loadAgents(): void {
    this.isLoadingAgents = true;
    this.agentsErrorMessage = '';

    this.apiService
      .getCorretores()
      .pipe(
        catchError(() => {
          this.agentsErrorMessage = 'Nao foi possivel carregar os agentes.';
          return of([] as Usuarios[]);
        })
      )
      .subscribe((agents) => {
        this.agents = agents || [];
        this.isLoadingAgents = false;
      });
  }

  private toStartOfDay(value: string): string | null {
    return value ? `${value}T00:00:00` : null;
  }

  private toEndOfDay(value: string): string | null {
    return value ? `${value}T23:59:59` : null;
  }
}
