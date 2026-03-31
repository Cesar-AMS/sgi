import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { CreditAnalysis } from 'src/app/models/credit-analysis.model';
import { CreditAnalysisService } from 'src/app/core/services/credit-analysis.service';
import { SalesService } from 'src/app/core/services/sales.service';

@Component({
  selector: 'app-credit-analysis',
  templateUrl: './credit-analysis.component.html',
  styleUrl: './credit-analysis.component.scss'
})
export class CreditAnalysisComponent implements OnInit {
  readonly statusOptions = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'EM_ANALISE', label: 'Em análise' },
    { value: 'APROVADO', label: 'Aprovado' },
    { value: 'REPROVADO', label: 'Reprovado' },
  ];

  saleId!: number;
  loading = false;
  saving = false;
  sale: any = null;
  analysis: CreditAnalysis = this.createEmptyAnalysis();

  constructor(
    private route: ActivatedRoute,
    private creditAnalysisService: CreditAnalysisService,
    private salesService: SalesService
  ) {}

  ngOnInit(): void {
    const saleIdParam = this.route.snapshot.paramMap.get('saleId');
    this.saleId = Number(saleIdParam);
    this.analysis = this.createEmptyAnalysis();
    this.loadData();
  }

  save(): void {
    if (!this.saleId) {
      return;
    }

    this.saving = true;
    if (this.analysis.id) {
      this.creditAnalysisService.update(this.analysis).subscribe({
        next: () => {
          this.saving = false;
        },
        error: (error: unknown) => {
          console.error('Erro ao atualizar análise de crédito', error);
          this.saving = false;
        }
      });
      return;
    }

    this.creditAnalysisService.create(this.analysis).subscribe({
      next: (result) => {
        this.analysis = result;
        this.saving = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao salvar análise de crédito', error);
        this.saving = false;
      }
    });
  }

  private loadData(): void {
    if (!this.saleId) {
      return;
    }

    this.loading = true;

    forkJoin({
      sale: this.salesService.getOpportunityById(this.saleId).pipe(catchError(() => of(null))),
      analysis: this.creditAnalysisService.getBySaleId(this.saleId).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ sale, analysis }) => {
        this.sale = sale;
        this.analysis = analysis ?? this.createEmptyAnalysis();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar análise de crédito', error);
        this.analysis = this.createEmptyAnalysis();
        this.loading = false;
      }
    });
  }

  private createEmptyAnalysis(): CreditAnalysis {
    return {
      saleId: this.saleId,
      customerId: null,
      status: 'PENDENTE',
      summary: '',
      restrictions: '',
      observations: '',
      analystUserId: null,
      analystName: '',
    };
  }
}
