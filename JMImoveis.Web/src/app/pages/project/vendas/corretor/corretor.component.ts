import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CommercialResultsService } from 'src/app/core/services/commercial-results.service';
import { CorretorDashboardResponse, ManagerOption } from 'src/app/models/ContaBancaria';

type MonthYearOpt = { month: number; year: number; label: string; short: string };
type Row12 = { name: string; values: number[] };


@Component({
  selector: 'app-corretor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './corretor.component.html',
  styleUrls: ['./corretor.component.scss']
})
export class CorretorComponent implements OnInit {

  // período
  monthYearOptions: MonthYearOpt[] = [];
  selectedPeriod!: MonthYearOpt;
  mesLabel = '';
  mesCurto = '';

  // gerente
  managerOptions: ManagerOption[] = [{ id: null, label: 'Todos' }];
  selectedManagerId: number | null = null;
  get currentManagerLabel() {
    return this.managerOptions.find(m => m.id === this.selectedManagerId)?.label ?? 'Todos';
  }

  monthsHeader = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  // dados
  salariosCorretores: Row12[] = [];
  salariosGerentes: Row12[] = [];
  comissoesCorretores: Row12[] = [];
  comissoesGerentes: Row12[] = [];
  despesasFiliais: Row12[] = [];

  // totais por coluna
  totalSalariosCorretores: number[] = Array(12).fill(0);
  totalSalariosGerentes: number[] = Array(12).fill(0);
  totalComissoesCorretores: number[] = Array(12).fill(0);
  totalComissoesGerentes: number[] = Array(12).fill(0);
  totalDespesasFiliais: number[] = Array(12).fill(0);

  constructor(private commercialResultsService: CommercialResultsService) {}

  ngOnInit(): void {
    this.buildMonthYearOptions();
    this.onChangePeriod(); // carrega mês atual + gerente default
  }

  private buildMonthYearOptions(qtdMeses = 18) {
    const now = new Date();
    const opts: MonthYearOpt[] = [];
    for (let i = 0; i < qtdMeses; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const short = d.toLocaleDateString('pt-BR', { month: 'short' });
      opts.push({ month: d.getMonth() + 1, year: d.getFullYear(), label: this.cap(label), short: this.cap(short) });
    }
    this.monthYearOptions = opts;
    this.selectedPeriod = opts[0];
    this.mesLabel = this.selectedPeriod.label;
    this.mesCurto = this.selectedPeriod.short;
  }

  onChangePeriod() {
    this.mesLabel = this.selectedPeriod.label;
    this.mesCurto = this.selectedPeriod.short;
    this.loadFromApi(this.selectedPeriod.year, this.selectedPeriod.month, this.selectedManagerId);
  }

  onChangeManager() {
    this.loadFromApi(this.selectedPeriod.year, this.selectedPeriod.month, this.selectedManagerId);
  }

  private loadFromApi(year: number, month: number, managerId: number | null) {
    this.commercialResultsService.getBrokerDashboard(year, month, managerId).subscribe({
      next: (res) => this.applyResponse(res),
      error: (err) => console.error('Erro ao carregar dashboard corretor:', err)
    });
  }

  private applyResponse(res: CorretorDashboardResponse) {
    // opções de gerente
    this.managerOptions = res.managerOptions?.length ? res.managerOptions : [{ id: null, label: 'Todos' }];
    // define default uma única vez (se nada selecionado)
    if (this.selectedManagerId === undefined || this.selectedManagerId === null) {
      this.selectedManagerId = res.defaultManagerId ?? null;
    }

    this.salariosCorretores   = res.salariosCorretores ?? [];
    this.salariosGerentes     = res.salariosGerentes ?? [];
    this.comissoesCorretores  = res.comissoesCorretores ?? [];
    this.comissoesGerentes    = res.comissoesGerentes ?? [];
    this.despesasFiliais      = res.despesasFiliais ?? [];

    this.totalSalariosCorretores  = this.sumColumns(this.salariosCorretores);
    this.totalSalariosGerentes    = this.sumColumns(this.salariosGerentes);
    this.totalComissoesCorretores = this.sumColumns(this.comissoesCorretores);
    this.totalComissoesGerentes   = this.sumColumns(this.comissoesGerentes);
    this.totalDespesasFiliais     = this.sumColumns(this.despesasFiliais);
  }

  private sumColumns(rows: Row12[]): number[] {
    const totals = Array(12).fill(0);
    for (const r of rows) for (let i = 0; i < 12; i++) totals[i] += Number(r.values?.[i] ?? 0);
    return totals;
  }

  fmt(n: number) { return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n ?? 0); }
  private cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

  exportPDF() {
    const el = document.getElementById('corretor-root');
    if (!el) return;
    html2canvas(el, { scale: 2, backgroundColor: '#ffffff' }).then((canvas) => {
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 40, imgH = canvas.height * (imgW / canvas.width);
      pdf.addImage(img, 'PNG', 20, Math.max(20, (pageH - imgH)/2), imgW, imgH);
      pdf.save(`dashboard-corretor-${this.mesLabel}-${this.currentManagerLabel}.pdf`);
    });
  }
}
