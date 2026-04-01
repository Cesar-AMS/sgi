import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { ConstructorTransferService } from 'src/app/core/services/constructor-transfer.service';
import { EnterprisesService } from 'src/app/core/services/enterprises.service';
import { SalesService } from 'src/app/core/services/sales.service';
import { ConstructorTransfer } from 'src/app/models/constructor-transfer.model';
import { Construtoras, Empreendimento, Sales } from 'src/app/models/ContaBancaria';

@Component({
  selector: 'app-constructor-transfer',
  templateUrl: './constructor-transfer.component.html',
  styleUrl: './constructor-transfer.component.scss'
})
export class ConstructorTransferComponent implements OnInit {
  readonly statusOptions = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'PROGRAMADO', label: 'Programado' },
    { value: 'REPASSADO', label: 'Repassado' },
    { value: 'BLOQUEADO', label: 'Bloqueado' },
  ];

  saleId!: number;
  loading = false;
  saving = false;
  sale: Sales | null = null;
  enterprise: Empreendimento | null = null;
  constructorData: Construtoras | null = null;
  transfer: ConstructorTransfer = this.createEmptyTransfer();

  constructor(
    private route: ActivatedRoute,
    private salesService: SalesService,
    private enterprisesService: EnterprisesService,
    private constructorTransferService: ConstructorTransferService
  ) {}

  ngOnInit(): void {
    const saleIdParam = this.route.snapshot.paramMap.get('saleId');
    this.saleId = Number(saleIdParam);
    this.transfer = this.createEmptyTransfer();
    this.loadData();
  }

  save(): void {
    if (!this.saleId) {
      return;
    }

    this.transfer.saleId = this.saleId;
    this.transfer.constructorId = this.constructorData?.id ?? this.transfer.constructorId ?? null;
    this.saving = true;

    if (this.transfer.id) {
      this.constructorTransferService.update(this.transfer).subscribe({
        next: () => {
          this.saving = false;
        },
        error: (error: unknown) => {
          console.error('Erro ao atualizar repasse', error);
          this.saving = false;
        }
      });
      return;
    }

    this.constructorTransferService.create(this.transfer).subscribe({
      next: (result) => {
        this.transfer = result;
        this.saving = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao salvar repasse', error);
        this.saving = false;
      }
    });
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
      { label: 'Contrato', value: this.sale.contractNumber },
    ].filter((item) => item.value !== null && item.value !== undefined && item.value !== '');
  }

  private loadData(): void {
    if (!this.saleId) {
      return;
    }

    this.loading = true;

    forkJoin({
      sale: this.salesService.getOpportunityById(this.saleId).pipe(catchError(() => of(null))),
      transfer: this.constructorTransferService.getBySaleId(this.saleId).pipe(catchError(() => of(null))),
    }).pipe(
      switchMap(({ sale, transfer }) => {
        this.sale = sale;
        this.transfer = transfer ?? this.createTransferFromSale(sale);

        if (!sale?.enterpriseId) {
          return of({ enterprise: null, constructorData: null });
        }

        return this.enterprisesService.getEnterpriseById(sale.enterpriseId).pipe(
          catchError(() => of(null)),
          switchMap((enterprise) => {
            this.enterprise = enterprise;

            if (!enterprise?.constructorId) {
              return of({ enterprise, constructorData: null });
            }

            return this.enterprisesService.getConstructorById(enterprise.constructorId).pipe(
              catchError(() => of(null)),
              switchMap((constructorData) => of({ enterprise, constructorData }))
            );
          })
        );
      })
    ).subscribe({
      next: ({ enterprise, constructorData }) => {
        this.enterprise = enterprise;
        this.constructorData = constructorData;

        if (constructorData?.id) {
          this.transfer.constructorId = constructorData.id;
        }

        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar repasse', error);
        this.transfer = this.createEmptyTransfer();
        this.loading = false;
      }
    });
  }

  private createEmptyTransfer(): ConstructorTransfer {
    return {
      saleId: this.saleId,
      constructorId: null,
      amount: 0,
      plannedDate: null,
      status: 'PENDENTE',
      observations: '',
    };
  }

  private createTransferFromSale(sale: Sales | null): ConstructorTransfer {
    return {
      ...this.createEmptyTransfer(),
      amount: Number(sale?.valueToConstructor ?? 0),
    };
  }
}
