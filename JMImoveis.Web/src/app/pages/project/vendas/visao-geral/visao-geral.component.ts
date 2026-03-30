import { DecimalPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { PageChangedEvent } from 'ngx-bootstrap/pagination';


import {
  selectData,
  selectlistData,
} from 'src/app/store/Invoices/invoices.selector';
import {
  deleteinvoice,
  fetchInvoiceData,
  fetchInvoicelistData,
} from 'src/app/store/Invoices/invoices.action';
import { Client, VendaDTO } from 'src/app/core/data/client';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModalVendaComponent } from '../../modal-venda/modal-venda.component';
import { ApiService } from 'src/app/core/services/api.service';
import { ExportExcelService } from 'src/app/shared/export-excel.service';
import { Act, Empreendimento, Filial, FormasPagamento, Installments, Sales, UnitsEnterprise, Usuarios } from 'src/app/models/ContaBancaria';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-visao-geral',
  providers: [DecimalPipe, DatePipe],
  templateUrl: './visao-geral.component.html',
  styleUrl: './visao-geral.component.scss',
})
export class VisaoGeralComponent {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  isEdicao: boolean = false;
  selectedDateRange: Date[] = [];
  managementId: number = 0;
  filter: any = { cliente: '' };
  listVendas: Sales[] = []
  formasPagamento: FormasPagamento[] = [];
  objetoCriacao: Sales = {} as Sales; 
  invoiceslist: any;
  invoices: any;
  deleteID: any;
  gerentes: Usuarios[] = [];
  act: Act = {} as Act;
  installaments: Installments[] = [];
  installamentsCorretor: Installments[] = [];
  installamentsGerente: Installments[] = [];

  masterSelected!: boolean;
  invoiceCard: any;
  term: any;

  bsConfig?: Partial<BsDatepickerConfig>;

  empreendimentos: Empreendimento[] = [];
  filiais: Filial[] = [];

  pagedVendas: Sales[] = [];
  filteredVendas: Sales[] = [];
  totalItemsVendas = 0;

  pageVendas = 1;
  itemsPerPageVendas = 50;
  perPageOptionsVendas = [50, 100, 150];

  hidden: number = 0;

  colorTheme: any = 'theme-blue';
  dependent: boolean = false;
  corretores: Usuarios[] = [];

  totalAto: number = 0;
  totalRestante: number = 0;

  gerentesAll: Usuarios[] = [];
  coordenatorsAll: Usuarios[] = [];

  @ViewChild('deleteRecordModal', { static: false })
  deleteRecordModal?: ModalDirective;
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;

  constructor(
    public store: Store,
    private apiService: ApiService,
    private toastr: ToastrService,
    private excel: ExportExcelService
  ) { }

  ngOnInit(): void {

    this.buscarVendas()

    this.apiService.getEmpreendimentos().subscribe((data: Empreendimento[]) => {
      this.empreendimentos = data
    })

    this.apiService.getFiliais().subscribe((data: Filial[]) => {
      console.log('Log filial', data)
      this.filiais = data
    })

    this.apiService.getGerentes().subscribe((data) => {
      this.gerentesAll = data
    });

    this.apiService.getCoordenadores().subscribe((data) => {
      this.coordenatorsAll = data
    });

    this.apiService.getUsersByCargoAndFilial(3, 0, this.hidden).subscribe((data: Usuarios[]) => {
      this.gerentes = data
    })

    this.apiService.getCorretores().subscribe((data) => {
      console.log('corretores', data)
      this.corretores = data
    });

    this.apiService.getFormasPagamento().subscribe((data) => {
      this.formasPagamento = data
    })


    this.bsConfig = Object.assign(
      {},
      { containerClass: this.colorTheme, showWeekNumbers: false }
    );

    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Invoice', active: true },
      { label: 'Invoice List', active: true },
    ];

    // store

    // Fetch Data
    setTimeout(() => {
      this.store.dispatch(fetchInvoicelistData());
      this.store.select(selectlistData).subscribe((data) => {
        this.invoices = data;
        this.invoiceslist = data;
        this.invoices = this.invoiceslist.slice(0, 10);
      });
      document.getElementById('elmLoader')?.classList.add('d-none');
    }, 1000);


    this.store.dispatch(fetchInvoiceData());
    this.store.select(selectData).subscribe((data) => {
      this.invoiceCard = data;
    });
  }

  enterpriseId: number = 0;
  filialId: number = 0;
  status: string = "ABC";
  startAt: string = moment().subtract(90, 'days').format('YYYY-MM-DD');
  finishAt: string = moment().format('YYYY-MM-DD');


  changeFilial() {
    this.apiService.getUsersByCargoAndFilial(3, this.filialId, this.hidden).subscribe((data: Usuarios[]) => {
      this.gerentes = data
    })

    this.managementId = 0
    this.buscarVendas()
  }


  applyFilterAndPaginateVendas(): void {
    const termo = (this.filter?.cliente || '').toString().trim().toLowerCase();

    this.filteredVendas = (this.listVendas || []).filter(v =>
      !termo || (v.cliente || '').toLowerCase().includes(termo)
    );

    this.totalItemsVendas = this.filteredVendas.length;

    // se a página atual ficou inválida após filtro, volta pra 1
    this.pageVendas = 1;
    this.updatePagedVendas();
  }

  updatePagedVendas(): void {
    const start = (this.pageVendas - 1) * this.itemsPerPageVendas;
    const end = start + this.itemsPerPageVendas;
    this.pagedVendas = this.filteredVendas.slice(start, end);
  }

  onPageChangedVendas(event: PageChangedEvent): void {
    this.pageVendas = event.page;
    this.itemsPerPageVendas = event.itemsPerPage;
    this.updatePagedVendas();
  }

  onItemsPerPageChangeVendas(value: number): void {
    this.itemsPerPageVendas = Number(value);
    this.pageVendas = 1;
    this.updatePagedVendas();
  }

  getStartIndexVendas(): number {
    if (this.totalItemsVendas === 0) return 0;
    return (this.pageVendas - 1) * this.itemsPerPageVendas + 1;
  }

  getEndIndexVendas(): number {
    return Math.min(this.pageVendas * this.itemsPerPageVendas, this.totalItemsVendas);
  }

  buscarVendas() {

    var obj = {
      startAt: moment(this.startAt).format('YYYY-MM-DD'),
      finishAt: moment(this.finishAt).format('YYYY-MM-DD'),
      enterpriseId: this.enterpriseId,
      filialId: this.filialId,
      clienteId: 0,
      status: this.status,
      managementId: this.managementId
    }

    // Enviar para a API
    this.apiService.postFilterVenda(obj).subscribe((data) => {
      this.listVendas = data
      this.applyFilterAndPaginateVendas();
    })

  }


  dataFinal(): Date | null {
    return this.selectedDateRange && this.selectedDateRange.length > 1
      ? this.selectedDateRange[1]
      : null;
  }


  disableInputs: boolean = false;

  @ViewChild('meuModal', { static: false }) meuModal!: ModalVendaComponent;

  listAto: any[] = [];

  addAto() {
    this.listAto.push({
      ato: 1,
      vencimento: '23/07/2025',
      datePagamento: '15/12/2027',
      obs: 'teste',
      status: 'paga',
    });
  }

  listIntermed: any[] = [];

  addIntermed() {
    this.listIntermed.push({
      ato: 1,
      vencimento: '23/07/2025',
      datePagamento: '15/12/2027',
      obs: 'teste',
      status: 'paga',
    });
  }

  exportarExcel(): void {
    const data = this.listVendas.map(e => ({
      'DATA VENDA': e.selledAt,
      'FILIAL': e.branchId,
      'EMPREENDIMENTO': e.enterpriseId,
      'UNIDADE': e.unitId,
      'VALOR MÓVEL': e.unitValue,
      'CLIENTE': '',
      'CORRETOR': '',
      'GERENTE': e.managerId
    }));

    this.excel.exportJson(data, 'Lista de Clientes');
  }

  unidades: UnitsEnterprise[] = [];

  getUnits() {
    this.unidades = []

    this.apiService.getAllUnitsActiveByEnterprise(this.objetoCriacao.enterpriseId).subscribe((data: UnitsEnterprise[]) => {
      this.unidades = data
    })
  }


  openModalClient(action: 'new' | 'view' | 'edit', id?: number) {

    if (action === 'new') {
      this.meuModal.show(false);
    }

    if (action === 'view') {
      this.meuModal.show(true);
    }

    if (action === 'edit') {

      this.isEdicao = true;

      this.apiService.getVendaFullById(id as number).subscribe((data: Sales) => {
        this.objetoCriacao = data;

        data.selledAt = new Date(data.selledAt);

        this.objetoCriacao.selledAt = data.selledAt.toISOString().substring(0, 10);

        data.acts.forEach((act: Act) => {
          act.date = new Date(act.date);
          act.date = act.date.toISOString().substring(0, 10);
        });


        if (data?.acts?.length) {
          this.totalAto = data.acts
            .map((a: any) => a.value || 0)
            .reduce((sum: number, v: number) => sum + v, 0);

          this.totalRestante = (this.objetoCriacao.startValue || 0) - this.totalAto;
        }





        this.getUnits()
        this.showModal?.show();
      });


    }
  }

  // Sort Data
  direction: any = 'asc';
  onSort(column: any) {
    if (this.direction == 'asc') {
      this.direction = 'desc';
    } else {
      this.direction = 'asc';
    }
    const sortedArray = [...this.invoices]; // Create a new array
    sortedArray.sort((a, b) => {
      const res = this.compare(a[column], b[column]);
      return this.direction === 'asc' ? res : -res;
    });
    this.invoices = sortedArray;
  }
  compare(v1: string | number, v2: string | number) {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
  }

  // filterdata
  filterdata() {
    if (this.term) {
      this.invoices = this.invoiceslist.filter((el: any) =>
        el.customer.toLowerCase().includes(this.term.toLowerCase())
      );
    } else {
      this.invoices = this.invoiceslist;
    }
    // noResultElement
    this.updateNoResultDisplay();
  }

  // no result
  updateNoResultDisplay() {
    const noResultElement = document.querySelector('.noresult') as HTMLElement;

    if (this.term && this.invoices.length === 0) {
      noResultElement.style.display = 'block';
    } else {
      noResultElement.style.display = 'none';
    }
  }

  checkedValGet: any[] = [];
  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.invoices = this.invoices.map((x: { states: any }) => ({
      ...x,
      states: ev.target.checked,
    }));

    var checkedVal: any[] = [];
    var result;
    for (var i = 0; i < this.invoices.length; i++) {
      if (this.invoices[i].states == true) {
        result = this.invoices[i].id;
        checkedVal.push(result);
      }
    }

    this.checkedValGet = checkedVal;
    checkedVal.length > 0
      ? document.getElementById('remove-actions')?.classList.remove('d-none')
      : document.getElementById('remove-actions')?.classList.add('d-none');
  }
  // Select Checkbox value Get
  onCheckboxChange(e: any) {
    var checkedVal: any[] = [];
    var result;
    for (var i = 0; i < this.invoices.length; i++) {
      if (this.invoices[i].states == true) {
        result = this.invoices[i].id;
        checkedVal.push(result);
      }
    }
    this.checkedValGet = checkedVal;
    checkedVal.length > 0
      ? document.getElementById('remove-actions')?.classList.remove('d-none')
      : document.getElementById('remove-actions')?.classList.add('d-none');
  }

  // Delete Product
  removeItem(id: any) {
    this.deleteID = id;
    this.deleteRecordModal?.show();
  }

  deleteData(id: any) {
    this.deleteRecordModal?.hide();
    if (id) {
      this.store.dispatch(deleteinvoice({ id: this.deleteID.toString() }));
    }
    this.store.dispatch(deleteinvoice({ id: this.checkedValGet.toString() }));
    this.deleteRecordModal?.hide();
    this.masterSelected = false;
  }

  // Page Changed
  pageChanged(event: any): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.invoices = this.invoiceslist.slice(startItem, endItem);
  }

  private formatDate(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso as any);
    return isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString('pt-BR');
  }
  private brl(v?: number) {
    return (Number(v ?? 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  exportarPDF() {
    // se sua API já devolve filtrado, pode usar direto this.listVendas
    // se quiser aplicar o mesmo filtro de cliente usado no template:
    const termo = (this.filter?.cliente || '').trim().toLowerCase();
    const vendas = this.listVendas.filter(v =>
      !termo || (v.cliente || '').toLowerCase().includes(termo)
    );

    if (!vendas.length) {
      this.toastr?.info?.('Nenhum registro para exportar.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });

    autoTable(doc, {
      head: [[
        'DATA VENDA', 'FILIAL', 'EMPREENDIMENTO', 'UNIDADE',
        'VALOR MÓVEL', 'CLIENTE', 'CORRETOR', 'GERENTE'
      ]],
      body: vendas.map(v => [
        this.formatDate(v.selledAt as any),
        v.branchName ?? '',
        v.enterpriseName ?? '',
        v.unitName ?? '',
        this.brl(v.unitValue),
        v.cliente ?? '',
        v.corretor ?? '',
        v.gerente ?? ''
      ]),
      styles: { fontSize: 9, cellPadding: 6 },
      margin: { left: 24, right: 24, top: 24 },
    });

    doc.save('vendas.pdf');
  }

  recalculate() {
    console.log('recalculte')

    this.totalAto = this.listAto.reduce((acc, item) => {
      return item.status === 'PAID' ? acc + Number(item.value || 0) : acc;
    }, 0);

    this.totalRestante = Number(this.objetoCriacao.startValue) - Number(this.totalAto)

    this.setCommissionCorretor();
    this.setCommissionGerente();
  }


  setCommissionCorretor() {
    var corretor = this.corretores.filter(i => +i.id === +this.objetoCriacao.realtorId)[0];

    console.log('corretor selecionado', corretor)

    if (corretor?.valueCommissioned === 100) {
      this.objetoCriacao.realtorComission = 100;
      this.objetoCriacao.percentageToRealtor = undefined;

      return;
    }

    if (this.objetoCriacao?.startValue >= 5000) {
      this.objetoCriacao.percentageToRealtor = Number(((corretor.valueCommissionedMax ?? 0) * 100).toFixed(2));
      this.objetoCriacao.realtorComission = Number((this.objetoCriacao?.unitValue * (corretor.valueCommissionedMax ?? 0)).toFixed(2));
    }
    else {
      this.objetoCriacao.percentageToRealtor = Number(((corretor.valueCommissioned ?? 0) * 100).toFixed(2));
      this.objetoCriacao.realtorComission = Number((this.objetoCriacao?.unitValue * (corretor.valueCommissioned ?? 0)).toFixed(2));
    }

  }


  setCommissionGerente() {
    var gerente = this.gerentes.filter(g => +g.id === +this.objetoCriacao.managerId)[0];

    if (this.objetoCriacao.startValue >= 5000) {
      this.objetoCriacao.percentageToManager = Number(((gerente.valueCommissionedMax ?? 0) * 100).toFixed(2));
      this.objetoCriacao.managerComission = Number((this.objetoCriacao?.unitValue * (gerente.valueCommissionedMax ?? 0)).toFixed(2));
    }
    else {
      this.objetoCriacao.percentageToManager = Number(((gerente.valueCommissioned ?? 0) * 100).toFixed(2));
      this.objetoCriacao.managerComission = Number((this.objetoCriacao?.unitValue * (gerente.valueCommissioned ?? 0)).toFixed(2));
    }
  }

  remover(id: number) {
    this.listAto = this.listAto.filter(x => x.id !== id);

    this.recalculate()
  }

  trackById = (_: number, it: Act) => it.id;

  trackByNro = (_: number, p: Installments) => p.id;

  trackByNroIntermed = (_: number, p: Installments) => p.id;
}
