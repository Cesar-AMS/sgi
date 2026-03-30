import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';
import { DreLine, DreResponse, DreTotals } from 'src/app/models/ContaBancaria';
import * as moment from 'moment';

// ===== Tipos =====
type TipoConta = 'RECEITA' | 'DESPESA' | 'DISTRIB';


@Component({
  selector: 'app-dre',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, FormsModule],
  templateUrl: './dre.component.html'
})
export class DreComponent implements OnInit {

  months = moment().format('YYYY-MM');
  categoryId?: number | null = null;
  costCenterId?: number | null = null;

  totals?: DreTotals;
  lines: DreLine[] = [];

  revenueLines: DreLine[] = [];
  expenseLines: DreLine[] = [];
  revenueTotal = 0;
  expenseTotal = 0;

  loading = false;
  error?: string;

  constructor(private dreService: ApiService) { }

  ngOnInit(): void {
    // mês corrente (AAAA-MM)
    this.months = moment().format('YYYY-MM');
    this.load();
  }

  private getPeriod() {
    const start = moment(this.months).startOf('month');
    const end = start.clone().endOf('month')
    console.log('Period', start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
    return {
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD')
    };
  }

  private fmtBR(n: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);
  }


  load() {
    this.loading = true;
    this.error = undefined;

    const { startDate, endDate } = this.getPeriod();

    this.dreService.getDre({ startDate, endDate, categoryId: this.categoryId ?? undefined, costCenterId: this.costCenterId ?? undefined })
      .subscribe({
        next: (res) => this.bind(res),
        error: (e) => { this.error = 'Falha ao carregar DRE'; console.error(e); },
        complete: () => this.loading = false
      });
  }

  private bind(res: DreResponse) {
    this.totals = res.totals;
    this.lines = (res.lines ?? []).sort((a, b) => a.accountCode.localeCompare(b.accountCode));

    this.revenueLines = this.lines.filter(l => l.section === 'RECEITA');
    this.expenseLines = this.lines.filter(l => l.section === 'DESPESA');

    this.revenueTotal = this.revenueLines.reduce((acc, l) => acc + (l.totalReceita ?? 0), 0);
    this.expenseTotal = this.expenseLines.reduce((acc, l) => acc + (l.totalDespesa ?? 0), 0);
  }

  onMonthChange() { this.load(); }

  exportCSV() {
    // simples CSV client-side
    const head = ['Conta', 'Descrição', 'Receita', 'Despesa', 'Líquido'];
    const rows = this.lines.map(l => [
      l.accountCode,
      l.accountName.replaceAll(';', ','),
      l.totalReceita.toString().replace('.', ','),
      l.totalDespesa.toString().replace('.', ','),
      l.totalLiquido.toString().replace('.', ',')
    ]);
    const csv = [head, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dre_${this.months}.csv`;
    a.click();
  }


  exportPDF() {
    if (!this.totals) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const margin = 36;
    const pageW = doc.internal.pageSize.getWidth();
    const title = 'DRE • por mês';
    const sub = `Mês: ${this.months}`;
    const resumo = `Receita Bruta: ${this.fmtBR(this.totals.grossRevenue)}   ` +
      `Despesas Totais: ${this.fmtBR(this.totals.totalExpenses)}   ` +
      `Resultado Operacional: ${this.fmtBR(this.totals.operatingResult)}`;

    // cabeçalho
    let y = margin;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text(title, margin, y);
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    y += 18; doc.text(sub, margin, y);
    y += 14; doc.text(resumo, margin, y);
    y += 12;

    // ------- Tabela: RECEITAS -------
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text('Receitas', margin, y);
    y += 6;

    const revRows: RowInput[] = this.revenueLines.map(l => ([
      l.accountCode,
      l.accountName,
      this.fmtBR(l.totalReceita),
      this.fmtBR(l.totalDespesa),
      this.fmtBR(l.totalLiquido),
    ]));
    // linha de subtotal
    revRows.push([
      { content: 'Subtotal Receitas', colSpan: 2, styles: { fontStyle: 'bold' } } as any,
      this.fmtBR(this.revenueTotal),
      '—',
      '—',
    ]);

    autoTable(doc, {
      head: [['Conta', 'Descrição', 'Receita', 'Despesa', 'Líquido']],
      body: revRows,
      startY: y + 6,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [245, 245, 248], textColor: 0 },
      columnStyles: {
        0: { halign: 'left', cellWidth: 90 },
        1: { halign: 'left' },
        2: { halign: 'right', cellWidth: 100 },
        3: { halign: 'right', cellWidth: 100 },
        4: { halign: 'right', cellWidth: 100 },
      },
    });

    // ------- Tabela: DESPESAS -------
    let nextY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text('Despesas', margin, nextY);
    const expRows: RowInput[] = this.expenseLines.map(l => ([
      l.accountCode,
      l.accountName,
      this.fmtBR(l.totalReceita),
      this.fmtBR(l.totalDespesa),
      this.fmtBR(l.totalLiquido),
    ]));
    expRows.push([
      { content: 'Subtotal Despesas', colSpan: 3, styles: { fontStyle: 'bold' } } as any,
      this.fmtBR(this.expenseTotal),
      '—',
    ]);

    autoTable(doc, {
      head: [['Conta', 'Descrição', 'Receita', 'Despesa', 'Líquido']],
      body: expRows,
      startY: nextY + 6,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [245, 245, 248], textColor: 0 },
      columnStyles: {
        0: { halign: 'left', cellWidth: 90 },
        1: { halign: 'left' },
        2: { halign: 'right', cellWidth: 100 },
        3: { halign: 'right', cellWidth: 100 },
        4: { halign: 'right', cellWidth: 100 },
      },
    });

    // rodapé com numeração de páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Página ${i} de ${pageCount}`, pageW - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    doc.save(`dre_${this.months}.pdf`);
  }



}
