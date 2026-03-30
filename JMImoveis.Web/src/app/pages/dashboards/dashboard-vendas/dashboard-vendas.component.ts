import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HostListener } from '@angular/core';


import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import 'chart.js/auto';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DashboardSalesService, SalesByEntityDto, SalesByMonthDto } from 'src/app/core/services/dashboard-sales.service';

type MonthYearOpt = { month: number; year: number; label: string };

@Component({
  selector: 'app-dashboard-vendas',
  standalone: true,
  templateUrl: './dashboard-vendas.component.html',
  styleUrls: ['./dashboard-vendas.component.scss'],
  imports: [CommonModule, FormsModule, HttpClientModule, NgChartsModule]
})
export class DashboardVendasComponent implements OnInit {
  // ======= Filtros =======
  monthYearOptions: MonthYearOpt[] = [];
  selectedPeriod!: MonthYearOpt;
  mesLabel = '';
  presentationMonth = new Date().getMonth() + 1;  // mês controlado dentro da apresentação

  months = [
    { v: 1, l: 'Jan' }, { v: 2, l: 'Fev' }, { v: 3, l: 'Mar' }, { v: 4, l: 'Abr' },
    { v: 5, l: 'Mai' }, { v: 6, l: 'Jun' }, { v: 7, l: 'Jul' }, { v: 8, l: 'Ago' },
    { v: 9, l: 'Set' }, { v: 10, l: 'Out' }, { v: 11, l: 'Nov' }, { v: 12, l: 'Dez' },
  ];
  filtroMesCorretor = new Date().getMonth() + 1;
  filtroMesGerente = new Date().getMonth() + 1;
  filtroMesCoord = new Date().getMonth() + 1;
  filtroMesFilial = new Date().getMonth() + 1;

  // ======= Loading/Error =======
  loading = false;
  error?: string;

  // ======= DPI / qualidade =======
  private pixelRatio = Math.min(window.devicePixelRatio || 1, 2); // ↑ para 3 se quiser ainda mais nítido

  // ======= CHART 1: Vendas por mês (ano) =======
  vendasPorMesData: ChartData<'bar' | 'line'> = { labels: [], datasets: [] };
  vendasPorMesOpts: ChartOptions<'bar' | 'line'> = this.dualAxis('Qtde', 'Valor (R$)');

  // ======= CHART 2..5: por entidade (mês) =======
  porCorretorData: ChartData<'bar' | 'line'> = { labels: [], datasets: [] };
  porGerenteData: ChartData<'bar' | 'line'> = { labels: [], datasets: [] };
  porCoordData: ChartData<'bar' | 'line'> = { labels: [], datasets: [] };
  porFilialData: ChartData<'bar' | 'line'> = { labels: [], datasets: [] };

  porCorretorOpts = this.dualAxis('Qtde', 'Valor (R$)');
  porGerenteOpts = this.dualAxis('Qtde', 'Valor (R$)');
  porCoordOpts = this.dualAxis('Qtde', 'Valor (R$)');
  porFilialOpts = this.dualAxis('Qtde', 'Valor (R$)');

  // ======= Apresentação =======
  presentation = false;
  slide = 0; // 0..4
  slidesTitles = [
    'Vendas por Mês',
    'Vendas por Corretor',
    'Vendas por Gerente',
    'Vendas por Coordenador',
    'Vendas por Filial'
  ];

  constructor(private api: DashboardSalesService) { }

  ngOnInit(): void {
    this.buildMonthYearOptions();
    this.onChangePeriod(); // carrega tudo para o ano/mês atual
  }

  // ================== Filtros ==================
  private buildMonthYearOptions(qtdMeses = 18) {
    const now = new Date();
    const opts: MonthYearOpt[] = [];
    for (let i = 0; i < qtdMeses; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      opts.push({ month, year, label: label[0].toUpperCase() + label.slice(1) });
    }
    this.monthYearOptions = opts;
    this.selectedPeriod = opts[0];
    this.mesLabel = this.selectedPeriod.label;
  }

  onChangePeriod() {
    this.mesLabel = this.selectedPeriod.label;
    this.loadByMonth(this.selectedPeriod.year); // gráfico 1
    this.reloadEntities();                      // gráficos 2..5
  }

  // ================== Carregamentos ==================
  /** Gráfico 1: Vendas por mês (ano) */
  private loadByMonth(year: number) {
    this.loading = true; this.error = undefined;
    this.api.byMonth(year).subscribe({
      next: (rows: SalesByMonthDto[]) => {
        const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const quantity = Array(12).fill(0);
        const values = Array(12).fill(0);
        rows.forEach(r => {
          const idx = (r.month ?? 0) - 1;
          if (idx >= 0 && idx < 12) {
            quantity[idx] = r.quantity ?? 0;
            values[idx] = Number(r.totalValue ?? 0);
          }
        });

        this.vendasPorMesData = {
          labels,
          datasets: [
            {
              type: 'bar',
              label: 'Qtde',
              data: quantity,
              yAxisID: 'y',
              borderWidth: 0,
              borderSkipped: false,
              barPercentage: 0.8,
              categoryPercentage: 0.6,
              maxBarThickness: 38
            },
            {
              type: 'line',
              label: 'Valor (R$)',
              data: values,
              yAxisID: 'y1',
              tension: 0.3,
              borderWidth: 2.5,
              pointRadius: 1.5,
              pointHitRadius: 6,
              pointHoverRadius: 4,
              fill: false
            }
          ]
        };
      },
      error: (e) => { console.error(e); this.error = 'Falha ao carregar Vendas por mês.'; },
      complete: () => this.loading = false
    });
  }

  /** Recarrega gráficos por entidade (2..5) com ano do período atual */
  reloadEntities() {
    const y = this.selectedPeriod.year;
    this.loadRealtor(y, this.filtroMesCorretor);
    this.loadManager(y, this.filtroMesGerente);
    this.loadCoord(y, this.filtroMesCoord);
    this.loadBranch(y, this.filtroMesFilial);
  }

  // ======= 2) Corretor =======
  loadRealtor(year: number, month: number) {
    this.api.byRealtor(year, month).subscribe({
      next: rows => this.porCorretorData = this.mapEntity(rows, 'Corretor'),
      error: e => console.error(e)
    });
  }

  // ======= 3) Gerente =======
  loadManager(year: number, month: number) {
    this.api.byManager(year, month).subscribe({
      next: rows => this.porGerenteData = this.mapEntity(rows, 'Gerente'),
      error: e => console.error(e)
    });
  }

  // ======= 4) Coordenador =======
  loadCoord(year: number, month: number) {
    this.api.byCoordenator(year, month).subscribe({
      next: rows => this.porCoordData = this.mapEntity(rows, 'Coord.'),
      error: e => console.error(e)
    });
  }

  // ======= 5) Filial =======
  loadBranch(year: number, month: number) {
    this.api.byBranch(year, month).subscribe({
      next: rows => this.porFilialData = this.mapEntity(rows, 'Filial'),
      error: e => console.error(e)
    });
  }

  // ================== Map Helpers ==================
  private mapEntity(rows: SalesByEntityDto[], prefix: string): ChartData<'bar' | 'line'> {
    const labels = rows.map(r => (r.name && r.name.trim().length > 0) ? r.name! : `${prefix} #${r.id}`);
    const qtds = rows.map(r => r.quantity ?? 0);
    const vals = rows.map(r => Number(r.totalValue ?? 0));

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Qtde',
          data: qtds,
          yAxisID: 'y',
          borderWidth: 0,
          borderSkipped: false,
          barPercentage: 0.8,
          categoryPercentage: 0.6,
          maxBarThickness: 38
        },
        {
          type: 'line',
          label: 'Valor (R$)',
          data: vals,
          yAxisID: 'y1',
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: 1.5,
          pointHitRadius: 6,
          pointHoverRadius: 4,
          fill: false
        }
      ]
    };
  }

  private dualAxis(yL: string, yR: string): ChartOptions<'bar' | 'line'> {
    return {
      responsive: true,
      maintainAspectRatio: false,        // respeita altura definida no CSS
      devicePixelRatio: this.pixelRatio, // alta densidade (nitidez)
      animation: false,                  // menos blur em transições
      normalized: true,                  // estabilidade numérica
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxRotation: 0, autoSkip: true, font: { size: 11 } }
        },
        y: {
          position: 'left',
          title: { display: true, text: yL },
          grid: { lineWidth: 0.5 },
          ticks: { precision: 0, font: { size: 11 } }
        },
        y1: {
          position: 'right',
          title: { display: true, text: yR },
          grid: { drawOnChartArea: false, lineWidth: 0.5 },
          ticks: {
            callback: (v) => new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(Number(v)),
            font: { size: 11 }
          }
        }
      },
      plugins: {
        legend: { labels: { font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.y ?? 0;
              return ctx.dataset.label?.includes('Valor')
                ? `${ctx.dataset.label}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}`
                : `${ctx.dataset.label}: ${val}`;
            }
          }
        }
      }
    };
  }

  // ================== Apresentação ==================
  entrarApresentacao() {
    const mesAtual = new Date().getMonth() + 1;
    this.presentationMonth = mesAtual;                 // controla o seletor dentro do modo
    this.filtroMesCorretor = mesAtual;
    this.filtroMesGerente = mesAtual;
    this.filtroMesCoord = mesAtual;
    this.filtroMesFilial = mesAtual;
    this.reloadEntities();
    this.presentation = true;
    this.slide = 0;
  }

  aplicarMesApresentacao() {
    this.filtroMesCorretor = this.presentationMonth;
    this.filtroMesGerente = this.presentationMonth;
    this.filtroMesCoord = this.presentationMonth;
    this.filtroMesFilial = this.presentationMonth;
    this.reloadEntities();
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.presentation) return;
    if (e.key === 'ArrowRight') { this.prox(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { this.ant(); e.preventDefault(); }
    else if (e.key === 'Escape') { this.sairApresentacao(); e.preventDefault(); }
  }

  sairApresentacao() { this.presentation = false; }
  prox() { this.slide = (this.slide + 1) % 5; }
  ant() { this.slide = (this.slide + 4) % 5; }

  // ================== Export ==================
  exportPDF() {
    const el = document.getElementById('dash-root');
    if (!el) return;
    html2canvas(el, { scale: 2, backgroundColor: '#ffffff' }).then((canvas) => {
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 40;
      const imgH = canvas.height * (imgW / canvas.width);
      const y = (pageH - imgH) / 2;
      pdf.addImage(img, 'PNG', 20, Math.max(20, y), imgW, imgH);
      pdf.save(`dashboard-vendas-${this.mesLabel}.pdf`);
    });
  }

  get presentationMonthLabel(): string {
    const m = this.months.find(m => m.v === this.presentationMonth);
    return m?.l ?? '';
  }
}
