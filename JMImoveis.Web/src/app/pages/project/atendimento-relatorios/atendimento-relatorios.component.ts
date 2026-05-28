import { Component, OnInit } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { AtendimentoRelatoriosService } from 'src/app/core/services/atendimento-relatorios.service';
import { Usuarios } from 'src/app/models/ContaBancaria';
import {
  AtendimentoRelatorioFunil,
  AtendimentoRelatorioGrupo,
  AtendimentoRelatorioRanking,
  AtendimentoRelatorioResponse,
} from 'src/app/models/atendimento-relatorio';
import { exportToExcel } from 'src/app/shared/utils/excel-export';

type DateRange = 'today' | 'last7' | 'last30' | 'thisMonth' | 'thisYear' | 'all';
type ReportSection = 'overview' | 'leads' | 'schedules' | 'visits' | 'postVisit' | 'conversion' | 'print';

type SummaryCard = {
  label: string;
  value: number;
  description: string;
};

type ReportSectionTab = {
  key: ReportSection;
  label: string;
  description: string;
};

type PostVisitMetricCard = {
  label: string;
  value: number | null;
  description: string;
  available: boolean;
};

type ConversionCard = {
  label: string;
  percentage: number;
  numerator: number;
  denominator: number;
  description: string;
};

type GroupRow = {
  label: string;
  total: number;
};

type FunnelRow = {
  name: string;
  leads: number;
  agendamentos: number;
  visitas: number;
  realizadas: number;
  compareceu: number;
  virouVenda: number;
  leadToAgendamento: number;
  agendamentoToVisita: number;
  visitaToVenda: number;
};

type RankingRow = {
  position: number;
  name: string;
  value: number;
  detail?: string;
};

@Component({
  selector: 'app-atendimento-relatorios',
  templateUrl: './atendimento-relatorios.component.html',
  styleUrls: ['./atendimento-relatorios.component.scss'],
})
export class AtendimentoRelatoriosComponent implements OnInit {
  isLoading = false;
  isLoadingFilters = false;
  errorMessage = '';
  filterErrorMessage = '';
  hasReportData = false;
  periodLabel = 'Ultimos 30 dias';
  activeSection: ReportSection = 'overview';

  dateRange: DateRange = 'last30';
  vendedorFilter = '';
  coordenadorFilter = '';
  gerenteFilter = '';

  dateRangeOptions: { label: string; value: DateRange }[] = [
    { label: 'Hoje', value: 'today' },
    { label: 'Ultimos 7 dias', value: 'last7' },
    { label: 'Ultimos 30 dias', value: 'last30' },
    { label: 'Este mes', value: 'thisMonth' },
    { label: 'Este ano', value: 'thisYear' },
    { label: 'Todos', value: 'all' },
  ];

  reportSections: ReportSectionTab[] = [
    { key: 'overview', label: 'Resumo', description: 'Indicadores gerais do atendimento' },
    { key: 'leads', label: 'Leads', description: 'Status e etapas de atendimento' },
    { key: 'schedules', label: 'Agendamentos', description: 'Status de contatos e retornos' },
    { key: 'visits', label: 'Visitas', description: 'Visitas, equipe e conversoes' },
    { key: 'postVisit', label: 'Pos-visita', description: 'Metricas disponiveis e pendencias confiaveis' },
    { key: 'conversion', label: 'Funil', description: 'Funis e rankings gerenciais' },
    { key: 'print', label: 'Previa', description: 'Visualizacao antes da impressao' },
  ];

  corretores: Usuarios[] = [];
  coordenadores: Usuarios[] = [];
  gerentes: Usuarios[] = [];

  summaryCards: SummaryCard[] = [];
  postVisitMetricCards: PostVisitMetricCard[] = [];
  conversionCards: ConversionCard[] = [];
  leadsByStatus: GroupRow[] = [];
  leadsByEtapa: GroupRow[] = [];
  agendamentosByStatus: GroupRow[] = [];
  visitasByStatus: GroupRow[] = [];
  visitasByVendedor: GroupRow[] = [];
  visitasByGestao: GroupRow[] = [];
  sellerFunnelRows: FunnelRow[] = [];
  coordinatorFunnelRows: FunnelRow[] = [];
  managerFunnelRows: FunnelRow[] = [];
  topLeadSellers: RankingRow[] = [];
  topScheduleSellers: RankingRow[] = [];
  topVisitSellers: RankingRow[] = [];
  topSaleSellers: RankingRow[] = [];
  topVisitToSaleConversion: RankingRow[] = [];

  constructor(
    private apiService: ApiService,
    private atendimentoRelatoriosService: AtendimentoRelatoriosService
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.periodLabel = this.getPeriodLabel();

    const { startAt, finishAt } = this.getDatesFromRange(this.dateRange);

    this.atendimentoRelatoriosService
      .getResumo({
        startAt,
        finishAt,
        vendedorId: this.vendedorFilter || null,
        coordenadorId: this.coordenadorFilter || null,
        gerenteId: this.gerenteFilter || null,
      })
      .pipe(
        catchError(() => {
          this.errorMessage = 'Nao foi possivel carregar os relatorios consolidados.';
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.applyConsolidatedReport(response);
          } else {
            this.clearReportData();
          }

          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel carregar os relatorios de atendimento.';
          this.clearReportData();
          this.isLoading = false;
        },
      });
  }

  hasData(): boolean {
    return this.hasReportData;
  }

  onFilterChange(): void {
    this.loadReports();
  }

  clearFilters(): void {
    this.dateRange = 'last30';
    this.vendedorFilter = '';
    this.coordenadorFilter = '';
    this.gerenteFilter = '';
    this.loadReports();
  }

  getPeriodLabel(): string {
    return this.dateRangeOptions.find((option) => option.value === this.dateRange)?.label || 'Periodo';
  }

  trackByLabel(_: number, item: { label: string }): string {
    return item.label;
  }

  trackByName(_: number, item: { name: string }): string {
    return item.name;
  }

  trackByPosition(_: number, item: { position: number; name: string }): string {
    return `${item.position}-${item.name}`;
  }

  trackBySection(_: number, item: ReportSectionTab): ReportSection {
    return item.key;
  }

  trackByPostVisitMetric(_: number, item: PostVisitMetricCard): string {
    return item.label;
  }

  setActiveSection(section: ReportSection): void {
    this.activeSection = section;
  }

  printCurrentReport(): void {
    window.print();
  }

  exportExcel(): void {
    const data = [
      ...this.buildFilterExportRows(),
      ...this.buildSummaryExportRows(),
      ...this.buildPostVisitMetricExportRows(),
      ...this.buildConversionExportRows(),
      ...this.buildGroupExportRows('Leads por status', this.leadsByStatus),
      ...this.buildGroupExportRows('Leads por etapa de atendimento', this.leadsByEtapa),
      ...this.buildGroupExportRows('Agendamentos por status', this.agendamentosByStatus),
      ...this.buildGroupExportRows('Visitas por status', this.visitasByStatus),
      ...this.buildGroupExportRows('Visitas por vendedor', this.visitasByVendedor),
      ...this.buildGroupExportRows('Visitas por coordenador / gerente', this.visitasByGestao),
      ...this.buildFunnelExportRows('Funil por vendedor', this.sellerFunnelRows),
      ...this.buildFunnelExportRows('Funil por coordenador', this.coordinatorFunnelRows),
      ...this.buildFunnelExportRows('Funil por gerente', this.managerFunnelRows),
      ...this.buildRankingExportRows('Ranking - Top vendedores por leads', this.topLeadSellers),
      ...this.buildRankingExportRows('Ranking - Top vendedores por agendamentos', this.topScheduleSellers),
      ...this.buildRankingExportRows('Ranking - Top vendedores por visitas', this.topVisitSellers),
      ...this.buildRankingExportRows('Ranking - Top vendedores por virou venda', this.topSaleSellers),
      ...this.buildRankingExportRows('Ranking - Melhor conversao visita venda', this.topVisitToSaleConversion),
    ];

    exportToExcel(
      `relatorios_atendimento_${this.today()}.xlsx`,
      'Atendimento',
      data
    );
  }

  private applyConsolidatedReport(response: AtendimentoRelatorioResponse): void {
    const resumo = response.resumo || {
      totalLeads: 0,
      totalAgendamentos: 0,
      totalVisitas: 0,
      visitasRealizadas: 0,
      comparecimentos: 0,
      virouVenda: 0,
    };

    const conversoes = response.conversoes || {
      leadParaAgendamento: 0,
      agendamentoParaVisita: 0,
      visitaParaRealizada: 0,
      visitaParaComparecimento: 0,
      visitaParaVenda: 0,
    };

    this.summaryCards = [
      {
        label: 'Total de Leads',
        value: resumo.totalLeads || 0,
        description: 'Leads criados no periodo',
      },
      {
        label: 'Agendamentos',
        value: resumo.totalAgendamentos || 0,
        description: 'Registros com TipoAgenda contato',
      },
      {
        label: 'Visitas',
        value: resumo.totalVisitas || 0,
        description: 'Registros com TipoAgenda visita',
      },
      {
        label: 'Visitas realizadas',
        value: resumo.visitasRealizadas || 0,
        description: 'Visitas com status Realizada',
      },

      {
        label: 'Virou venda',
        value: resumo.virouVenda || 0,
        description: 'Visitas marcadas como virou venda',
      },
    ];

    this.postVisitMetricCards = [
      {
        label: 'Comparecimentos registrados',
        value: resumo.comparecimentos || 0,
        description: 'Visitas marcadas como compareceu no periodo filtrado.',
        available: true,
      },
      {
        label: 'Sinal de venda na visita',
        value: resumo.virouVenda || 0,
        description: 'Usa o campo virouVenda da visita. Nao confirma venda no modulo Vendas.',
        available: true,
      },
      {
        label: 'Retornaram apos visita',
        value: null,
        description: 'Pendente: exige regra confiavel com pos-visita, follow-up ou agendamento posterior a visita.',
        available: false,
      },
      {
        label: 'Venda confirmada apos visita',
        value: null,
        description: 'Pendente: exige vinculo confiavel entre pos-visita, proposta e venda aprovada.',
        available: false,
      },
    ];

    this.conversionCards = [
      {
        label: 'Lead -> Agendamento',
        percentage: conversoes.leadParaAgendamento || 0,
        numerator: resumo.totalAgendamentos || 0,
        denominator: resumo.totalLeads || 0,
        description: 'Agendamentos divididos pelo total de leads',
      },
      {
        label: 'Agendamento -> Visita',
        percentage: conversoes.agendamentoParaVisita || 0,
        numerator: resumo.totalVisitas || 0,
        denominator: resumo.totalAgendamentos || 0,
        description: 'Visitas divididas pelo total de agendamentos',
      },
      {
        label: 'Visita -> Realizada',
        percentage: conversoes.visitaParaRealizada || 0,
        numerator: resumo.visitasRealizadas || 0,
        denominator: resumo.totalVisitas || 0,
        description: 'Visitas realizadas divididas pelo total de visitas',
      },
      {
        label: 'Visita -> Comparecimento',
        percentage: conversoes.visitaParaComparecimento || 0,
        numerator: resumo.comparecimentos || 0,
        denominator: resumo.totalVisitas || 0,
        description: 'Comparecimentos divididos pelo total de visitas',
      },
      {
        label: 'Visita -> Virou venda',
        percentage: conversoes.visitaParaVenda || 0,
        numerator: resumo.virouVenda || 0,
        denominator: resumo.totalVisitas || 0,
        description: 'Visitas que viraram venda divididas pelo total de visitas',
      },
    ];

    this.leadsByStatus = this.mapGroupRows(response.agrupamentos?.leadsPorStatus);
    this.leadsByEtapa = this.mapGroupRows(response.agrupamentos?.leadsPorEtapa);
    this.agendamentosByStatus = this.mapGroupRows(response.agrupamentos?.agendamentosPorStatus);
    this.visitasByStatus = this.mapGroupRows(response.agrupamentos?.visitasPorStatus);

    this.sellerFunnelRows = this.mapFunnelRows(response.funilPorVendedor);
    this.coordinatorFunnelRows = this.mapFunnelRows(response.funilPorCoordenador);
    this.managerFunnelRows = this.mapFunnelRows(response.funilPorGerente);

    this.visitasByVendedor = this.sellerFunnelRows
      .filter((row) => row.visitas > 0)
      .map((row) => ({ label: row.name, total: row.visitas }));

    this.visitasByGestao = [
      ...this.coordinatorFunnelRows
        .filter((row) => row.visitas > 0)
        .map((row) => ({ label: `Coordenador: ${row.name}`, total: row.visitas })),
      ...this.managerFunnelRows
        .filter((row) => row.visitas > 0)
        .map((row) => ({ label: `Gerente: ${row.name}`, total: row.visitas })),
    ];

    this.topLeadSellers = this.mapRankingRows(response.rankings?.topLeads);
    this.topScheduleSellers = this.mapRankingRows(response.rankings?.topAgendamentos);
    this.topVisitSellers = this.mapRankingRows(response.rankings?.topVisitas);
    this.topSaleSellers = this.mapRankingRows(response.rankings?.topVirouVenda);
    this.topVisitToSaleConversion = this.mapRankingRows(
      response.rankings?.topConversaoVisitaVenda,
      true
    );

    this.hasReportData = this.summaryCards.some((card) => card.value > 0);
  }

  private clearReportData(): void {
    this.summaryCards = [];
    this.postVisitMetricCards = [];
    this.conversionCards = [];
    this.leadsByStatus = [];
    this.leadsByEtapa = [];
    this.agendamentosByStatus = [];
    this.visitasByStatus = [];
    this.visitasByVendedor = [];
    this.visitasByGestao = [];
    this.sellerFunnelRows = [];
    this.coordinatorFunnelRows = [];
    this.managerFunnelRows = [];
    this.topLeadSellers = [];
    this.topScheduleSellers = [];
    this.topVisitSellers = [];
    this.topSaleSellers = [];
    this.topVisitToSaleConversion = [];
    this.hasReportData = false;
  }

  private loadFilterOptions(): void {
    this.isLoadingFilters = true;
    this.filterErrorMessage = '';

    forkJoin({
      corretores: this.apiService.getCorretores().pipe(
        catchError(() => {
          this.appendFilterError('Nao foi possivel carregar vendedores.');
          return of([] as Usuarios[]);
        })
      ),
      coordenadores: this.apiService.getCoordenadores().pipe(
        catchError(() => {
          this.appendFilterError('Nao foi possivel carregar coordenadores.');
          return of([] as Usuarios[]);
        })
      ),
      gerentes: this.apiService.getGerentes().pipe(
        catchError(() => {
          this.appendFilterError('Nao foi possivel carregar gerentes.');
          return of([] as Usuarios[]);
        })
      ),
    }).subscribe({
      next: ({ corretores, coordenadores, gerentes }) => {
        this.corretores = corretores || [];
        this.coordenadores = coordenadores || [];
        this.gerentes = gerentes || [];
        this.isLoadingFilters = false;
      },
      error: () => {
        this.filterErrorMessage = 'Nao foi possivel carregar as listas de equipe.';
        this.isLoadingFilters = false;
      },
    });
  }

  private mapGroupRows(rows?: AtendimentoRelatorioGrupo[] | null): GroupRow[] {
    return (rows || []).map((row) => ({
      label: row.label || 'Nao informado',
      total: row.total || 0,
    }));
  }

  private mapFunnelRows(rows?: AtendimentoRelatorioFunil[] | null): FunnelRow[] {
    return (rows || []).map((row) => ({
      name: row.nome || 'Nao informado',
      leads: row.leads || 0,
      agendamentos: row.agendamentos || 0,
      visitas: row.visitas || 0,
      realizadas: row.realizadas || 0,
      compareceu: row.compareceu || 0,
      virouVenda: row.virouVenda || 0,
      leadToAgendamento: row.conversaoLeadAgendamento || 0,
      agendamentoToVisita: row.conversaoAgendamentoVisita || 0,
      visitaToVenda: row.conversaoVisitaVenda || 0,
    }));
  }

  private mapRankingRows(
    rows?: AtendimentoRelatorioRanking[] | null,
    usePercentualAsValue = false
  ): RankingRow[] {
    return (rows || []).map((row) => ({
      position: row.posicao || 0,
      name: row.nome || 'Nao informado',
      value: usePercentualAsValue ? row.percentual || 0 : row.valor || 0,
      detail: row.detalhe || undefined,
    }));
  }

  private getDatesFromRange(range: DateRange): { startAt: string | null; finishAt: string | null } {
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

  private buildFilterExportRows(): any[] {
    return [
      this.createExportRow('Filtros', 'Periodo', this.getPeriodLabel()),
      this.createExportRow('Filtros', 'Vendedor', this.getUserName(this.corretores, this.vendedorFilter) || 'Todos'),
      this.createExportRow('Filtros', 'Coordenador', this.getUserName(this.coordenadores, this.coordenadorFilter) || 'Todos'),
      this.createExportRow('Filtros', 'Gerente', this.getUserName(this.gerentes, this.gerenteFilter) || 'Todos'),
    ];
  }

  private buildSummaryExportRows(): any[] {
    return this.summaryCards.map((card) =>
      this.createExportRow('Resumo', card.label, card.value, card.description)
    );
  }

  private buildPostVisitMetricExportRows(): any[] {
    return this.postVisitMetricCards.map((card) =>
      this.createExportRow(
        'Pos-visita',
        card.label,
        card.available ? card.value ?? 0 : 'Pendente',
        card.description
      )
    );
  }

  private buildConversionExportRows(): any[] {
    return this.conversionCards.map((card) =>
      this.createExportRow(
        'Conversoes',
        card.label,
        `${card.percentage}%`,
        `${card.numerator} de ${card.denominator} - ${card.description}`
      )
    );
  }

  private buildGroupExportRows(section: string, rows: GroupRow[]): any[] {
    if (!rows.length) {
      return [this.createExportRow(section, 'Sem dados', 0)];
    }

    return rows.map((row) => this.createExportRow(section, row.label, row.total));
  }

  private buildFunnelExportRows(section: string, rows: FunnelRow[]): any[] {
    if (!rows.length) {
      return [this.createExportRow(section, 'Sem dados', 0)];
    }

    return rows.flatMap((row) => [
      this.createExportRow(section, `${row.name} - Leads`, row.leads),
      this.createExportRow(section, `${row.name} - Agendamentos`, row.agendamentos),
      this.createExportRow(section, `${row.name} - Visitas`, row.visitas),
      this.createExportRow(section, `${row.name} - Realizadas`, row.realizadas),
      this.createExportRow(section, `${row.name} - Compareceu`, row.compareceu),
      this.createExportRow(section, `${row.name} - Virou venda`, row.virouVenda),
      this.createExportRow(section, `${row.name} - Lead -> Agendamento`, `${row.leadToAgendamento}%`),
      this.createExportRow(section, `${row.name} - Agendamento -> Visita`, `${row.agendamentoToVisita}%`),
      this.createExportRow(section, `${row.name} - Visita -> Venda`, `${row.visitaToVenda}%`),
    ]);
  }

  private buildRankingExportRows(section: string, rows: RankingRow[]): any[] {
    if (!rows.length) {
      return [this.createExportRow(section, 'Sem dados', 0)];
    }

    return rows.map((row) =>
      this.createExportRow(section, `${row.position}. ${row.name}`, row.value, row.detail || '')
    );
  }

  private createExportRow(section: string, indicador: string, valor: string | number, detalhe = ''): any {
    return {
      Secao: section,
      Indicador: indicador,
      Valor: valor,
      Detalhe: detalhe,
    };
  }

  private today(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private getUserName(users: Usuarios[], id: string): string {
    return users.find((user) => this.sameId(user.id, id))?.name || '';
  }

  private sameId(left: unknown, right: unknown): boolean {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    return Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber > 0 && leftNumber === rightNumber;
  }

  private appendFilterError(message: string): void {
    this.filterErrorMessage = this.filterErrorMessage
      ? `${this.filterErrorMessage} ${message}`
      : message;
  }
}
