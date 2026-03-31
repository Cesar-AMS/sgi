import { Component, LOCALE_ID, OnInit } from '@angular/core';
import * as moment from 'moment';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { AccountOption, AccountSummary, AccountSummaryResponse, CostCenter, Entry, ReclassifyRequest } from 'src/app/models/contas';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { AccountPlain, AccountPlains, CentroCusto } from 'src/app/models/ContaBancaria';
import { AdminAccessService } from 'src/app/core/services/admin-access.service';
import { AccountAnalysisService } from 'src/app/core/services/account-analysis.service';

@Component({
  selector: 'app-contas-contabeis',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  providers: [DatePipe,{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './contas-contabeis.component.html',
  styleUrl: './contas-contabeis.component.scss'
})
export class ContasContabeisComponent implements OnInit {
 // filtros
  months = moment().format('YYYY-MM');
  type: 'all' | 'revenue' | 'expense' = 'all';
  costCenterId?: number | null = null;
  categoryId?: number | null = null;

  // summary
  loading = false;
  error?: string;
  items: AccountSummary[] = [];
  totalRevenue = 0;
  totalExpense = 0;
  totalNet = 0;

  // detalhe
  showDetail = false;
  detailTitle = '';
  selectedAccount?: { id: number; code: string; name: string };
  detailLoading = false;
  detailItems: Entry[] = [];

  // reclass
  reclassOpen = false;
  reclassTarget?: Entry;
  reclass: ReclassifyRequest = { costCenterId: 0, accountId: undefined, categoryId: undefined, reason: '' };
  planAcc: AccountPlains[] = [];
  costCenters: CentroCusto[] = [];
  saving = false;

  constructor(
    private adminAccessService: AdminAccessService,
    private accountAnalysisService: AccountAnalysisService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.adminAccessService.listAccountPlains().subscribe((data: any) => {
      this.planAcc = data;
    });

    
     this.adminAccessService.listCostCenters().subscribe((data) => {
      this.costCenters = data;
    });
  }

  private getPeriod() {
    const start = moment( this.months  ).startOf('month');
    const end = start.clone().endOf('month')
    console.log('Period', start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
    return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
  }

  loadSummary() {
    this.loading = true; this.error = undefined;
    const { start, end } = this.getPeriod();
    this.accountAnalysisService.getSummary({
      start, end, type: this.type,
      costCenterId: this.costCenterId ?? undefined,
      categoryId:  this.categoryId  ?? undefined
    }).subscribe({
      next: (res: AccountSummaryResponse) => {
        this.items = (res.items ?? []).sort((a,b) => a.accountCode.localeCompare(b.accountCode));
        this.totalRevenue = res.totalRevenue ?? 0;
        this.totalExpense = res.totalExpense ?? 0;
        this.totalNet     = res.totalNet ?? 0;
      },
      error: (e) => { this.error = 'Falha ao carregar resumo'; console.error(e); },
      complete: () => this.loading = false
    });
  }

  openDetail(acc: AccountSummary) {
    this.selectedAccount = { id: acc.accountId, code: acc.accountCode, name: acc.accountName };
    this.detailTitle = `Lançamentos • ${acc.accountCode} — ${acc.accountName}`;
    this.showDetail = true;
    this.detailLoading = true;

    const { start, end } = this.getPeriod();
    this.accountAnalysisService.getEntries(acc.accountId, {
      start, end, type: this.type,
      costCenterId: this.costCenterId ?? undefined,
      categoryId:  this.categoryId  ?? undefined
    }).subscribe({
      next: rows => this.detailItems = rows,
      error: e => console.error(e),
      complete: () => this.detailLoading = false
    });
  }

  closeDetail() { this.showDetail = false; this.detailItems = []; this.selectedAccount = undefined; }

  // ---------- Reclass ----------
  openReclass(entry: Entry) {
    this.reclassTarget = entry;
    this.reclass = {
      costCenterId: entry.costCenterId,
      accountId: entry.accountId,
      categoryId: entry.categoryId ?? undefined,
      reason: ''
    };
    this.reclassOpen = true;
  }

  closeReclass() { this.reclassOpen = false; this.reclassTarget = undefined; }

  submitReclass() {
    if (!this.reclassTarget) return;
    this.saving = true;
    this.accountAnalysisService.reclassify(this.reclassTarget.kind, this.reclassTarget.id, this.reclass).subscribe({
      next: () => {
        // atualiza a lista de detalhe (otimista)
        const i = this.detailItems.findIndex(x => x.id === this.reclassTarget!.id);
        if (i >= 0) {
          this.detailItems[i] = {
            ...this.detailItems[i],
            costCenterId: this.reclass.costCenterId,
            accountId: this.reclass.accountId ?? this.detailItems[i].accountId,
            categoryId: this.reclass.categoryId ?? this.detailItems[i].categoryId
          };
        }
        this.loadSummary();
        this.closeReclass();
      },
      error: e => { alert('Erro ao reclassificar'); console.error(e); },
      complete: () => this.saving = false
    });
  }

  // ---------- Export helpers ----------
  fmt(n: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0); }

  exportCSV() {
    const head = ['Conta', 'Descrição', 'Tipo', 'Receita', 'Despesa', 'Líquido'];
    const rows = this.items.map(i => [
      i.accountCode,
      i.accountName.replaceAll(';', ','),
      i.section,
      String(i.revenue).replace('.', ','),
      String(i.expense).replace('.', ','),
      String(i.net).replace('.', ',')
    ]);
    const csv = [head, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `contas_${this.months}.csv`;
    a.click();
  }

  exportPDF() {
    const { start, end } = this.getPeriod();
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const margin = 36, pageW = doc.internal.pageSize.getWidth();

    doc.setFont('helvetica','bold'); doc.setFontSize(16);
    doc.text('Contas Contábeis • Resumo Mensal', margin, margin);
    doc.setFontSize(11); doc.setFont('helvetica','normal');
    doc.text(`Período: ${start} a ${end}`, margin, margin + 18);
    doc.text(
      `Totais — Receita: ${this.fmt(this.totalRevenue)}   Despesa: ${this.fmt(this.totalExpense)}   Líquido: ${this.fmt(this.totalNet)}`,
      margin, margin + 34
    );

    const body: RowInput[] = this.items.map(i => ([
      i.accountCode,
      i.accountName,
      i.section,
      this.fmt(i.revenue),
      this.fmt(i.expense),
      this.fmt(i.net)
    ]));

    autoTable(doc, {
      head: [['Conta', 'Descrição', 'Tipo', 'Receita', 'Despesa', 'Líquido']],
      body,
      startY: margin + 48,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [245,245,248], textColor: 0 },
      columnStyles: {
        0: { halign: 'left', cellWidth: 100 },
        1: { halign: 'left' },
        2: { halign: 'left', cellWidth: 80 },
        3: { halign: 'right', cellWidth: 100 },
        4: { halign: 'right', cellWidth: 100 },
        5: { halign: 'right', cellWidth: 100 },
      },
      foot: [[
        { content: 'Totais', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } } as any,
        this.fmt(this.totalRevenue), this.fmt(this.totalExpense), this.fmt(this.totalNet)
      ]]
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Página ${i} de ${pageCount}`, pageW - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }
    doc.save(`contas_${this.months}.pdf`);
  }
}
