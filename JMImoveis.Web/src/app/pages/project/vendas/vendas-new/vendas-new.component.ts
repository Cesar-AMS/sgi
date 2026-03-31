import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SalesService } from 'src/app/core/services/sales.service';
import { Sale } from 'src/app/models/sale.mode';
import { ApiService } from 'src/app/core/services/api.service';
import { Cliente, Empreendimento, Filial, FormasPagamento, UnitsEnterprise, Usuarios } from 'src/app/models/ContaBancaria';
import { forkJoin, of, switchMap } from 'rxjs';


export interface Parcel {
  id?: number;
  number: number;
  value: number;
  date: string;           // yyyy-MM-dd
  observations?: string;
  status: string;         // WAITING / PAID / DEFAULT...
  type: string;           // ACT / DEFAULT / INTERMEDIARY
}

@Component({
  selector: 'app-vendas-new',
  templateUrl: './vendas-new.component.html',
  styleUrl: './vendas-new.component.scss'
})
export class VendasNewComponent implements OnInit {
  @ViewChild('pdfArea') pdfArea!: ElementRef;

  readonly saleStatusOptions = [
    { value: 'OPEN', label: 'Ativo' },
    { value: 'WAITING', label: 'Pendente' },
    { value: 'FAILED', label: 'Desistiu' },
    { value: 'APPROVED', label: 'Aprovado' },
  ];

  form!: FormGroup;
  isEdit = false;
  saleId?: number;
  loading = false;
  saving = false;
  statusSaving = false;
  closing = false;

  currencyOptions = {
  prefix: 'R$ ',
  thousands: '.',
  decimal: ',',
  precision: 2,
  allowNegative: false,
  align: 'left'
};

  // MOCKS - depois você troca por dados vindos da API

  // Corretor / Coordenador / etc (já existiam)

  commercialManagers = [
    { id: 30, name: 'Gestor Comercial Ricardo' },
    { id: 31, name: 'Gestora Comercial Fernanda' }
  ];

  // Empreendimentos (id, name, label)
  enterprises = [
    { id: 1, name: 'Residencial Alpha', label: 'Residencial Alpha' },
    { id: 2, name: 'Residencial Beta', label: 'Residencial Beta' }
  ];

  disabled() {
    return false
  }

  // Unidades (id, name, label)
  unitsList = [
    { id: 101, name: 'Bloco A / Ap 11', label: 'Bloco A - Ap 11' },
    { id: 102, name: 'Bloco A / Ap 12', label: 'Bloco A - Ap 12' }
  ];

  // Formas de Pagamento (id, name, label)
  paymentTypes = [
    { id: 1, name: 'Financiamento', label: 'Financiamento Bancário' },
    { id: 2, name: 'À Vista', label: 'Pagamento à Vista' },
    { id: 3, name: 'Misto', label: 'Entrada + Financiamento' }
  ];

  // Clientes (agora com name/label, usado no ng-select multiple)
  clients = [
    { id: 100, name: 'Cliente A', label: 'Cliente A' },
    { id: 101, name: 'Cliente B', label: 'Cliente B' },
    { id: 102, name: 'Cliente C', label: 'Cliente C' }
  ];

  // ATO (parcelas do ato - type ACT)
  actParcels: Parcel[] = [];
  newAct = {
    value: 0,
    date: '',
    observations: '',
    status: 'WAITING'
  };

  // PARCELAS (type DEFAULT) – geradas automaticamente
  parcelStartDate = '';
  parcelAmount = 0;
  parcelQuantity = 0;
  paymentParcels: Parcel[] = [];

  // INTERMEDIÁRIAS (type INTERMEDIARY) – manual
  intermediaryParcels: Parcel[] = [];
  newIntermediary = {
    value: 0,
    date: '',
    observations: '',
    status: 'WAITING'
  };

  // controla exibição das assinaturas apenas no PDF
  showPdfSignatures = false;

  empreendimentos: Empreendimento[] = [];
  filiais: Filial[] = [];
  clientes: Cliente[] = [];
  gerentes: Usuarios[] = [];
  corretores: Usuarios[] = [];
  coordenatorsAll: Usuarios[] = [];
  formasPagamento: FormasPagamento[] = [];
  unidades: UnitsEnterprise[] = [];

  listClient: Cliente[] = [];

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private route: ActivatedRoute,
    private router: Router,
    private service: ApiService
  ) { }

  ngOnInit(): void {

    this.service.getCorretores().subscribe((data) => {
      console.log('corretores', data)
      this.corretores = data
    });


    this.service.getClientes().subscribe({
      next: (data) => {
        this.loading = false;
        this.listClient = data;
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });

    this.service.getCoordenadores().subscribe((data) => {
      console.log('coordenador', data)
      this.coordenatorsAll = data
    });


    this.service.getGerentes().subscribe((data) => {
      this.gerentes = data
    });

    this.service.getFormasPagamento().subscribe((data) => {
      this.formasPagamento = data
    })

    this.service.getEmpreendimentos().subscribe((data) => {
      this.empreendimentos = data
    })

    this.service.getFiliais().subscribe((data) => {
      this.filiais = data;
    });


    this.buildForm();

    const today = new Date().toISOString().substring(0, 10);
    this.newAct.date = today;
    this.parcelStartDate = today;
    this.newIntermediary.date = today;

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEdit = true;
      this.saleId = +idParam;
      this.loadSale(this.saleId);
    }
  }

  private buildForm(): void {
    const today = new Date().toISOString().substring(0, 10);

    this.form = this.fb.group({
      id: [null],

      branchId: [null, Validators.required],
      enterpriseId: [null, Validators.required],
      unitId: [null, Validators.required],
      selledAt: [today, Validators.required],
      payment_types_id: [null, Validators.required],
      contractNumber: [''],
      status: ['APPROVED', Validators.required],

      // ENVOLVIDOS NA VENDA
      realtorId: [null, Validators.required],   // Corretor
      coordenatorId: [null],                   // Coordenador
      managerId: [null],                       // Gerente
      commercialManagerId: [null],            // Gestor Comercial (só tela, ainda não no banco)
      clients_ids: [[] as number[]],            // multi-select de clientes

      // VALOR IMÓVEL + ATO
      unitValue: [0, [Validators.required, Validators.min(0)]],
      startValue: [0, [Validators.required, Validators.min(0)]],

      // CAMPOS OCULTOS (mantidos por contrato da tabela, mas não exibidos)
      valueToConstructor: [0],
      valueToRealstate: [0],        // base para % comissão
      percentageToRealstate: [0],
      grossEarnings: [0],
      netEarnings: [0],

      // COMISSÕES (% e valores principais)
      percentageToRealtor: [0],
      percentageToManager: [0],
      percentageToCoordenator: [0],
      percentageToFinancial: [0],
      percentageToTax: [0],

      realtorComission: [0],
      realtorComissionRemaining: [0],
      realtorComissionStatus: ['WAITING'],

      managerComission: [0],
      managerComissionRemaining: [0],
      managerComissionStatus: ['WAITING'],

      coordenatorComission: [0],
      coordenatorComissionStatus: ['WAITING'],

      financialComission: [0],
      financialComissionStatus: ['WAITING'],

      taxComission: [0],
      taxComissionStatus: ['WAITING'],

      // CAMPOS SISTEMA
      generateNotification: [false],
      notificatedDate: [null],
      deletedAt: [null],
      createdAt: [null],
      updatedAt: [null],
      contractPath: [''],

      // PARTICIPANTES 2 (presentes na tabela, mas não exibidos agora)
      realtorIdTwo: [null],
      realtorComissionTwo: [0],
      realtorComissionRemainingTwo: [0],
      realtorComissionStatusTwo: ['WAITING'],

      managerComissionTwo: [0],
      managerComissionRemainingTwo: [0],
      managerComissionStatusTwo: ['WAITING'],

      coordenatorIdTwo: [null],
      percentageToCoordenatorTwo: [0],
      percentageToRealtorTwo: [0],
      percentageToManagerTwo: [0],
      coordenatorComissionTwo: [0],
      coordenatorComissionStatusTwo: ['WAITING']
    });
  }

  private loadSale(id: number): void {
    this.loading = true;

    forkJoin({
      sale: this.salesService.getOpportunityById(id),
      parcels: this.salesService.getParcelsBySaleId(id),
      customers: this.salesService.getCustomerIdsBySaleId(id)
    })
      .pipe(
        switchMap(({ sale, parcels, customers }) => {
          // 1) preenche os campos da venda

          
          this.form.patchValue({
            ...sale,
            selledAt: this.toDateInputValue(sale.selledAt),
            clients_ids: customers ?? [] // ng-select multiple precisa de array
          });

          

          // 2) carrega unidades do empreendimento da venda e depois seta a unidade
          const enterpriseId = this.form.get('enterpriseId')?.value;
          if (!enterpriseId) return of({ parcels });

          return this.service.getAllUnitsByEnterpriseV2(enterpriseId).pipe(
            switchMap((units: UnitsEnterprise[]) => {
              this.unidades = units || [];

              // garante que a unidade fica selecionada no ng-select
              if (sale.unitId) this.form.get('unitId')?.setValue(sale.unitId);

              // recalcula unit_value, % e value_to_realstate com base na unidade
              //this.setUnitValue();

              return of({ parcels });
            })
          );
        })
      )
      .subscribe({
        next: ({ parcels }) => {
          // 3) separa parcels e preenche as tabelas
          this.fillParcelsFromApi(parcels || []);
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar venda', err);
          this.loading = false;
        }
      });
  }

  private fillParcelsFromApi(parcels: Parcel[]): void {
    this.actParcels = (parcels || [])
      .filter(p => p.type === 'ACT')
      .map((p, idx) => ({ ...p, number: p.number ?? (idx + 1) }));

    this.paymentParcels = (parcels || [])
      .filter(p => p.type === 'DEFAULT')
      .map((p, idx) => ({ ...p, number: p.number ?? (idx + 1) }));

    this.intermediaryParcels = (parcels || [])
      .filter(p => p.type === 'INTERMEDIARY')
      .map((p, idx) => ({ ...p, number: p.number ?? (idx + 1) }));

    // atualiza start_value como soma dos atos
    const totalAct = this.actParcels.reduce((s, p) => s + (Number(p.value) || 0), 0);
    this.form.patchValue({ startValue: totalAct });

    // opcional: preencher inputs “gerar parcelas” com base na primeira parcela
    if (this.paymentParcels.length) {
      this.parcelStartDate = this.paymentParcels[0].date;
      this.parcelAmount = Number(this.paymentParcels[0].value) || 0;
      this.parcelQuantity = this.paymentParcels.length;
    }
  }


  private toDateInputValue(date: any): string | null {
  if (!date) return null;

  // se já vier "YYYY-MM-DD"
  if (typeof date === 'string' && date.length >= 10) {
    return date.substring(0, 10);
  }

  // fallback
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  // usa o formato local (evita o shift de timezone no input)
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}


  getUnits() {
    this.unidades = []
    this.form.get('unitValue')?.setValue(0)

    this.service.getAllUnitsActiveByEnterprise(this.form.get('enterpriseId')?.value).subscribe((data: UnitsEnterprise[]) => {
      this.unidades = data
    })
  }

  setUnitValue() {
    const unidadeSelecionada = this.unidades.find(ut => +ut.id === +Number(this.form.get('unitId')?.value ?? 0));

    if (unidadeSelecionada) {
      this.form.get('unitValue')?.setValue(unidadeSelecionada.value);
      this.form.get('percentageToRealstate')?.setValue(unidadeSelecionada.commission)
      this.form.get('unitId')?.setValue(unidadeSelecionada.id);
      this.form.get('valueToRealstate')?.setValue(Number((unidadeSelecionada.value * (unidadeSelecionada.commission / 100)).toFixed(2)))
    } else {
      this.form.get('unitValue')?.setValue(0);
    }
  }

  // ---------- Helpers de validação visual ----------
  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  getError(field: string): string | null {
    const c = this.form.get(field);
    if (!c || !c.errors) return null;
    if (c.errors['required']) return 'Campo obrigatório.';
    if (c.errors['min']) return 'Valor mínimo inválido.';
    return 'Valor inválido.';
  }

  // ---------- ATO ----------
  addAct(): void {
    if (!this.newAct.value || this.newAct.value <= 0) return;

    const number = this.actParcels.length + 1;

    this.actParcels.push({
      number,
      value: this.newAct.value,
      date: this.newAct.date,
      observations: this.newAct.observations,
      status: this.newAct.status,
      type: 'ACT'
    });

    // atualiza start_value como soma dos atos
    const totalAct = this.actParcels.reduce((s, p) => s + p.value, 0);
    this.form.patchValue({ startValue: totalAct });

    // limpa form do ato
    this.newAct.value = 0;
    this.newAct.observations = '';
    this.newAct.status = 'WAITING';
  }

  removeAct(index: number): void {
    this.actParcels.splice(index, 1);
    const totalAct = this.actParcels.reduce((s, p) => s + p.value, 0);
    this.form.patchValue({ startValue: totalAct });
  }

  // ---------- PARCELAS (DEFAULT) ----------
  generateParcels(): void {
    if (!this.parcelStartDate || this.parcelAmount <= 0 || this.parcelQuantity <= 0) return;

    this.paymentParcels = [];
    let currentDate = new Date(this.parcelStartDate);

    for (let i = 1; i <= this.parcelQuantity; i++) {
      const isoDate = currentDate.toISOString().substring(0, 10);

      this.paymentParcels.push({
        number: i,
        value: this.parcelAmount,
        date: isoDate,
        status: 'WAITING',
        observations: '',
        type: 'DEFAULT'
      });

      currentDate = this.addDays(currentDate, 30);
    }
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  // ---------- INTERMEDIÁRIAS ----------
  addIntermediary(): void {
    if (!this.newIntermediary.value || this.newIntermediary.value <= 0) return;

    const number = this.intermediaryParcels.length + 1;

    this.intermediaryParcels.push({
      number,
      value: this.newIntermediary.value,
      date: this.newIntermediary.date,
      observations: this.newIntermediary.observations,
      status: this.newIntermediary.status,
      type: 'INTERMEDIARY'
    });

    this.newIntermediary.value = 0;
    this.newIntermediary.observations = '';
    this.newIntermediary.status = 'WAITING';
  }

  removeIntermediary(index: number): void {
    this.intermediaryParcels.splice(index, 1);
  }

  // ---------- COMISSÕES ----------
  private getBaseCommissionValue(): number {
    // base: valor da imobiliária
    const v = this.form.get('valueToRealstate')?.value;
    return v && v > 0 ? v : 0;
  }

  onCommissionValueChangePercent(fieldReference: any, fieldUpdate: any){
    
    const value = this.form.get(fieldReference)?.value || 0;
    const valueUnit = this.form.get('unitValue')?.value || 0;
    const perc = (value * valueUnit);
    this.form.patchValue({ [fieldUpdate]: +perc.toFixed(2) });
  }

  onCommissionValueChange(field: 'realtor' | 'manager' | 'coordenator' | 'financial'): void {
    const base = this.getBaseCommissionValue();
    if (base <= 0) return;

    let valueCtrlName = '';
    let percCtrlName = '';

    switch (field) {
      case 'realtor':
        valueCtrlName = 'realtorComission';
        percCtrlName = 'percentageToRealtor';
        break;
      case 'manager':
        valueCtrlName = 'managerComission';
        percCtrlName = 'percentageToManager';
        break;
      case 'coordenator':
        valueCtrlName = 'coordenatorComission';
        percCtrlName = 'percentageToCoordenator';
        break;
      case 'financial':
        valueCtrlName = 'financialComission';
        percCtrlName = 'percentageToFinancial';
        break;
    }

    const value = this.form.get(valueCtrlName)?.value || 0;
    const perc = (value / base) * 100;
    this.form.patchValue({ [percCtrlName]: +perc.toFixed(2) });
  }

  // ---------- SALVAR ----------
  save(): void {


    // uso any aqui pra não esbarrar em campos que ainda não estão no modelo Sale (ex.: commercial_manager_id, clients_ids)
    const sale: any = this.form.value;

    const parcels: Parcel[] = [
      ...this.actParcels,
      ...this.paymentParcels,
      ...this.intermediaryParcels
    ];

    this.saving = true;

    if (this.isEdit && this.saleId) {
      this.salesService.updateOpportunity(this.saleId, sale).subscribe({
        next: () => {
          this.saving = false;
        },
        error: (err) => {
          console.error('Erro ao atualizar venda', err);
          this.saving = false;
        }
      });
    } else {
      this.salesService.createOpportunity(sale, parcels, this.form.get('clients_ids')?.value).subscribe({
        next: (res: any) => {
          this.saving = false;
          const newId = res?.saleId ?? res?.id;
          if (newId) {
            this.router.navigate(['/jm/vendas/edit', newId]);
          }
        },
        error: (err) => {
          console.error('Erro ao criar venda', err);
          this.saving = false;
        }
      });
    }
  }

  updateStatus(): void {
    if (!this.isEdit || !this.saleId) {
      return;
    }

    const sale = this.form.getRawValue() as Sale;
    const status = this.form.get('status')?.value;

    if (!status) {
      return;
    }

    this.statusSaving = true;

    this.salesService.updateOpportunityStatus(this.saleId, sale, status).subscribe({
      next: () => {
        this.statusSaving = false;
      },
      error: (err) => {
        console.error('Erro ao atualizar status da venda', err);
        this.statusSaving = false;
      }
    });
  }

  closeSale(): void {
    if (!this.isEdit || !this.saleId) {
      return;
    }

    const contractNumberControl = this.form.get('contractNumber');
    const contractNumber = (contractNumberControl?.value ?? '').toString().trim();

    if (!contractNumber) {
      contractNumberControl?.markAsTouched();
      contractNumberControl?.setErrors({ required: true });
      return;
    }

    if (contractNumberControl?.hasError('required')) {
      contractNumberControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }

    this.form.patchValue({ status: 'APPROVED', contractNumber });

    const sale = this.form.getRawValue() as Sale;
    this.closing = true;

    this.salesService.closeOpportunity(this.saleId, sale).subscribe({
      next: () => {
        this.form.patchValue({ status: 'APPROVED' });
        this.closing = false;
      },
      error: (err) => {
        console.error('Erro ao fechar venda', err);
        this.closing = false;
      }
    });
  }

  calculatePercentageToRealtor(){

  }
  // ---------- PDF ----------
  async exportPdf(): Promise<void> {
    if (!this.pdfArea) return;

    // mostra assinaturas somente para o PDF
    this.showPdfSignatures = true;
    // dá um tempo pro Angular renderizar o *ngIf
    await new Promise(resolve => setTimeout(resolve, 100));

    const data = this.pdfArea.nativeElement as HTMLElement;
    const canvas = await html2canvas(data, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    const title = this.isEdit && this.saleId ? `venda-${this.saleId}` : 'venda-nova';
    pdf.save(`${title}.pdf`);

    this.showPdfSignatures = false;
  }

  get title(): string {
    return this.isEdit ? 'Editar Venda' : 'Nova Venda';
  }
}
