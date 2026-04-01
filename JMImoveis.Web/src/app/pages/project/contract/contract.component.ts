import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ContractService } from 'src/app/core/services/contract.service';
import { SalesService } from 'src/app/core/services/sales.service';
import { Contract } from 'src/app/models/contract.model';
import { Sales } from 'src/app/models/ContaBancaria';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrl: './contract.component.scss'
})
export class ContractComponent implements OnInit {
  readonly statusOptions = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'EMITIDO', label: 'Emitido' },
    { value: 'ASSINADO', label: 'Assinado' },
  ];

  saleId!: number;
  loading = false;
  saving = false;
  sale: Sales | null = null;
  contract: Contract = this.createEmptyContract();

  constructor(
    private route: ActivatedRoute,
    private salesService: SalesService,
    private contractService: ContractService
  ) {}

  ngOnInit(): void {
    const saleIdParam = this.route.snapshot.paramMap.get('saleId');
    this.saleId = Number(saleIdParam);
    this.contract = this.createEmptyContract();
    this.loadData();
  }

  save(): void {
    if (!this.saleId) {
      return;
    }

    this.contract.saleId = this.saleId;
    this.saving = true;

    if (this.contract.id) {
      this.contractService.update(this.contract).subscribe({
        next: () => {
          this.saving = false;
        },
        error: (error: unknown) => {
          console.error('Erro ao atualizar contrato', error);
          this.saving = false;
        }
      });
      return;
    }

    this.contractService.create(this.contract).subscribe({
      next: (result) => {
        this.contract = result;
        this.saving = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao salvar contrato', error);
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
      contract: this.contractService.getBySaleId(this.saleId).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ sale, contract }) => {
        this.sale = sale;
        this.contract = contract ?? this.createContractFromSale(sale);
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar contrato', error);
        this.contract = this.createEmptyContract();
        this.loading = false;
      }
    });
  }

  private createEmptyContract(): Contract {
    return {
      saleId: this.saleId,
      number: '',
      path: '',
      status: 'PENDENTE',
      observations: '',
    };
  }

  private createContractFromSale(sale: Sales | null): Contract {
    return {
      ...this.createEmptyContract(),
      number: sale?.contractNumber ?? '',
      path: sale?.contractPath ?? '',
    };
  }

  get saleContextRows(): Array<{ label: string; value: string | number | null | undefined }> {
    if (!this.sale) {
      return [];
    }

    return [
      { label: 'Venda', value: this.sale.id },
      { label: 'Status', value: this.sale.status },
      { label: 'Cliente', value: this.sale.cliente },
      { label: 'Filial', value: this.sale.branchName },
      { label: 'Empreendimento', value: this.sale.enterpriseName },
      { label: 'Unidade', value: this.sale.unitName },
      { label: 'Corretor', value: this.sale.corretor },
    ].filter((item) => item.value !== null && item.value !== undefined && item.value !== '');
  }
}
