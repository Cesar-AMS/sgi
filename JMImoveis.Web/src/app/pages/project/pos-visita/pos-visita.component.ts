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
