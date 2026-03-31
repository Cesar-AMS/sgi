import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
import { AccountOption, CostCenter, CostCenterSummary, Entry, ReclassifyRequest, SummaryResponse } from 'src/app/models/CC';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CostCenterAnalysisService } from 'src/app/core/services/cost-center-analysis.service';


@Component({
  selector: 'app-centro-custo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './centro-custo.component.html',
  styleUrl: './centro-custo.component.scss'
})
export class CentroCustoComponent  implements OnInit{

  month = moment().format('YYYY-MM');           // filtro (AAAA-MM)
  type: 'all'|'revenue'|'expense' = 'all';     // filtro tipo
  loading = false;
  error?: string;

  // summary
  items: CostCenterSummary[] = [];
  totalRevenue = 0;
  totalExpense = 0;
  totalNet = 0;

  // detail (drawer/modal)
  showDetail = false;
  detailTitle = '';
  detailLoading = false;
  detailItems: Entry[] = [];
  selectedCC?: { id: number; name: string };

  // reclass modal
  reclassOpen = false;
  reclassTarget?: Entry;
  costCenters: CostCenter[] = [];
  accounts: AccountOption[] = [];
  reclass: ReclassifyRequest = { costCenterId: 0, accountId: undefined, categoryId: undefined, reason: '' };
  saving = false;

  constructor(private costCenterAnalysisService: CostCenterAnalysisService) {}

  ngOnInit(): void {
   // this.loadSummary();
   // this.costCenterAnalysisService.getCostCenters().subscribe(cs => this.costCenters = cs);
   // this.costCenterAnalysisService.getAccounts().subscribe(a => this.accounts = a);
  }

  private getPeriod() {
     const start = moment( this.month  ).startOf('month');
        const end = start.clone().endOf('month')

    return {
      startDate: start.format('YYYY-MM-DD'),
      endDate:   end.format('YYYY-MM-DD')
    };
  }

  loadSummary() {
    this.loading = true; this.error = undefined;
    const { startDate, endDate } = this.getPeriod();
    this.costCenterAnalysisService.getMonthlySummary(startDate, endDate, this.type).subscribe({
      next: (res: SummaryResponse) => {
        this.items = res.items ?? [];
        this.totalRevenue = res.totalRevenue ?? 0;
        this.totalExpense = res.totalExpense ?? 0;
        this.totalNet = res.totalNet ?? 0;
      },
      error: (e) => { this.error = 'Falha ao carregar resumo'; console.error(e); },
      complete: () => this.loading = false
    });
  }

  openDetail(cc: CostCenterSummary) {
    this.selectedCC = { id: cc.costCenterId, name: cc.costCenterName };
    this.detailTitle = `Lançamentos • ${cc.costCenterName}`;
    this.showDetail = true;
    this.detailLoading = true;

    const { startDate, endDate } = this.getPeriod();
    this.costCenterAnalysisService.getEntries(cc.costCenterId, startDate, endDate, this.type).subscribe({
      next: (rows) => this.detailItems = rows,
      error: (e) => console.error(e),
      complete: () => this.detailLoading = false
    });
  }

  // Reclassificar
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

  submitReclass() {
    if (!this.reclassTarget) return;
    this.saving = true;
    this.costCenterAnalysisService.reclassify(this.reclassTarget.kind, this.reclassTarget.id, this.reclass).subscribe({
      next: () => {
        // otimista: atualiza a linha no detalhe
        if (this.selectedCC && this.reclass.costCenterId !== this.selectedCC.id) {
          // remove se saiu do CC atual
          this.detailItems = this.detailItems.filter(x => x.id !== this.reclassTarget!.id);
        } else {
          // mantém e troca dados
          const i = this.detailItems.findIndex(x => x.id === this.reclassTarget!.id);
          if (i >= 0) {
            this.detailItems[i] = {
              ...this.detailItems[i],
              costCenterId: this.reclass.costCenterId,
              accountId: this.reclass.accountId ?? this.detailItems[i].accountId,
              categoryId: this.reclass.categoryId ?? this.detailItems[i].categoryId
            };
          }
        }
        // recarrega o resumo pra refletir totais
        this.loadSummary();
        this.closeReclass();
      },
      error: (e) => { alert('Erro ao reclassificar'); console.error(e); },
      complete: () => this.saving = false
    });
  }

  closeDetail() { this.showDetail = false; this.detailItems = []; this.selectedCC = undefined; }
  closeReclass() { this.reclassOpen = false; this.reclassTarget = undefined; }

  // helpers
  fmt(n: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0); }
}

