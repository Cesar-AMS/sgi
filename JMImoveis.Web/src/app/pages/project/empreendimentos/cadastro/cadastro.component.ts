
import { DecimalPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { selectData, selectlistData } from 'src/app/store/Invoices/invoices.selector';
import { deleteinvoice, fetchInvoiceData, fetchInvoicelistData } from 'src/app/store/Invoices/invoices.action';
import { Client } from 'src/app/core/data/client';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Construtoras, Empreendimento } from 'src/app/models/ContaBancaria';
import { ToastrService } from 'ngx-toastr';
import { exportToExcel } from 'src/app/shared/utils/excel-export';
import { EnterprisesService } from 'src/app/core/services/enterprises.service';
import { ApiService } from 'src/app/core/services/api.service';


interface Empreendimentol {
  nome: string;
  torres: Torre[];
}

interface Torre {
  nome: string;
  andares: Andar[];
}

interface Andar {
  numero: number;
  apartamentos: (Apartamento | null)[];
}

interface Apartamento {
  numero: string;
  metragem: string;
  dormitorios: string;
  valor: string;
  tipo: string;
}

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  invoiceslist: any
  invoices: any;
  deleteID: any;
  masterSelected!: boolean;
  invoiceCard: any;
  term: any


  empreendimentos: Empreendimento[] = [];

  empreendimento: Empreendimento = {} as Empreendimento;
  
  torreA = {
  nome: 'Torre A',
  andares: [
    {
      numero: 4,
      apartamentos: [
        { numero: '1201', metragem: '35m²', dormitorios: '2 Dormitórios', valor: 'R$ 240.916,00', tipo: 'HIS-2' },
        { numero: '1202', metragem: '37m²', dormitorios: '2 Dormitórios', valor: 'R$ 260.006,00', tipo: 'HIS-2' },
         { numero: '1201', metragem: '35m²', dormitorios: '2 Dormitórios', valor: 'R$ 240.916,00', tipo: 'HIS-2' },
        { numero: '1202', metragem: '37m²', dormitorios: '2 Dormitórios', valor: 'R$ 260.006,00', tipo: 'HIS-2' },
         { numero: '1201', metragem: '35m²', dormitorios: '2 Dormitórios', valor: 'R$ 240.916,00', tipo: 'HIS-2' },
        { numero: '1202', metragem: '37m²', dormitorios: '2 Dormitórios', valor: 'R$ 260.006,00', tipo: 'HIS-2' },
          { numero: '1201', metragem: '35m²', dormitorios: '2 Dormitórios', valor: 'R$ 240.916,00', tipo: 'HIS-2' },
        { numero: '1202', metragem: '37m²', dormitorios: '2 Dormitórios', valor: 'R$ 260.006,00', tipo: 'HIS-2' },
         { numero: '1201', metragem: '35m²', dormitorios: '2 Dormitórios', valor: 'R$ 240.916,00', tipo: 'HIS-2' },
        { numero: '1202', metragem: '37m²', dormitorios: '2 Dormitórios', valor: 'R$ 260.006,00', tipo: 'HIS-2' },
         { numero: '1201', metragem: '35m²', dormitorios: '2 Dormitórios', valor: 'R$ 240.916,00', tipo: 'HIS-2' },
        { numero: '1202', metragem: '37m²', dormitorios: '2 Dormitórios', valor: 'R$ 260.006,00', tipo: 'HIS-2' }
      ]
    },
    {
      numero: 3,
      apartamentos: [
        { numero: '1101', metragem: '35m²', dormitorios: '2 Dormitórios', valor: 'R$ 240.916,00', tipo: 'HIS-2' },
         { numero: '1201', metragem: '35m²', dormitorios: '2 Dormitórios', valor: 'R$ 240.916,00', tipo: 'HIS-2' },
        { numero: '1202', metragem: '37m²', dormitorios: '2 Dormitórios', valor: 'R$ 260.006,00', tipo: 'HIS-2' }
      ]
    }
  ]
};


  
padronizarColunas(torre: any) {
  const max = Math.max(...torre.andares.map((a: any) => a.apartamentos.length));
  torre.andares.forEach((andar: any) => {
    while (andar.apartamentos.length < max) {
      andar.apartamentos.push(undefined); // ou null
    }
  });
  return torre;
}


  bsConfig?: Partial<BsDatepickerConfig>;

 listClient: number[] = [1,2,3,4,5];
  colorTheme: any = 'theme-blue';
  dependent: boolean = false

  @ViewChild('deleteRecordModal', { static: false }) deleteRecordModal?: ModalDirective;
   @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
     @ViewChild('viewUnidades', { static: false }) viewUnidades?: ModalDirective;

     construtoras: Construtoras[] = [];
     construtura: Construtoras = {} as Construtoras

   
  constructor(
    public store: Store,
    private enterprisesService: EnterprisesService,
    private service: ApiService,
    private toast: ToastrService
  ) {
    
  }

  ngOnInit() {

      this.enterprisesService.listConstructors().subscribe((data)=>{
      this.construtoras = data
    })

    this.enterprisesService.listEnterprises().subscribe((data)=>{
      this.empreendimentos = data
    })

    this.torreA = this.padronizarColunas(this.torreA);


    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme, showWeekNumbers: false });

    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Invoice', active: true },
      { label: 'Invoice List', active: true }
    ];
    // store

    // Fetch Data
    setTimeout(() => {
      this.store.dispatch(fetchInvoicelistData());
      this.store.select(selectlistData).subscribe((data) => {
        this.invoices = data;
        this.invoiceslist = data;
        this.invoices = this.invoiceslist.slice(0, 10)
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    }, 1000)

    this.store.dispatch(fetchInvoiceData());
    this.store.select(selectData).subscribe((data) => {
      this.invoiceCard = data;
    });
  }

  controllerNewConstrutora: boolean = false

  /*                            {{client.id}}
                                {{client.name}}
                                {{client.address}}
                                {{client.constructor}}
                                {{client.createdAt | date : 'dd/MM/yyyy hh:mm:ss'}}
                                */

exportExcel(): void {
  const data = (this.empreendimentos || []).map(r => ({
    Id: r.id,
    Name: r.name,
    Address: r.address,
    Construtora: r.constructor,
    Criacao: this.toBRDate(r.createdAt)
  }));

  exportToExcel(
    `empreendimento_${this.today()}.xlsx`,
    'Cadastro',
    data
  );
}

private today(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

private toBRDate(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

  newConstrutora(){
    this.service.postConstrutora(this.construtura).subscribe({
      next: () => {
        this.toast.success('Construtora cadastrada com sucesso!')
        this.service.getConstrutora().subscribe((data)=>{
      this.construtoras = data
      this.construtura.name = ''
    })
        this.controllerNewConstrutora = false
      },
      error: () => {this.toast.error('Erro ao cadastrar!')}
    })
  }

  disableInputs: boolean = false

  listAto: any[] = []

  addAto(){
    this.listAto.push({ato: 1, vencimento: '23/07/2025', datePagamento: '15/12/2027', obs: 'teste', status: 'paga'})
  }

  updateEmpreendimento(){
     this.enterprisesService.updateEnterprise(this.empreendimento.id, this.empreendimento).subscribe((data)=>{
      this.toast.success('Empreendimento atualizado com sucesso')
      this.showModal?.hide()
      this.enterprisesService.listEnterprises().subscribe((data)=>{
        this.empreendimentos = data
      })
    })
  }
  saveEmpreendimento(){
    this.enterprisesService.createEnterprise(this.empreendimento).subscribe((data)=>{
      this.toast.success('Empreendimento criado com sucesso')
      this.showModal?.hide()
      this.enterprisesService.listEnterprises().subscribe((data)=>{
        this.empreendimentos = data
      })
    })
  }

  listIntermed: any[] = []

  addIntermed(){
    this.listIntermed.push({ato: 1, vencimento: '23/07/2025', datePagamento: '15/12/2027', obs: 'teste', status: 'paga'})
  }

  titleModal: string = 'Novo'

  openModalClient(id: any, action: 'new' | 'view' | 'edit')
  {
    if(action === 'new')
      {
      this.empreendimento = {} as Empreendimento
      this.titleModal = 'Novo'
      this.disableInputs = false
      this.showModal?.show() 
    }

     

     if(action === 'edit'){
      this.titleModal = 'Editar'
      this.enterprisesService.getEnterpriseById(id).subscribe((data)=>{
        this.empreendimento = data
      })

      this.disableInputs = false
      this.showModal?.show() 
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
      this.invoices = this.invoiceslist.filter((el: any) => el.customer.toLowerCase().includes(this.term.toLowerCase()))
    } else {
      this.invoices = this.invoiceslist
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
    this.invoices = this.invoices.map((x: { states: any }) => ({ ...x, states: ev.target.checked }));

    var checkedVal: any[] = [];
    var result;
    for (var i = 0; i < this.invoices.length; i++) {
      if (this.invoices[i].states == true) {
        result = this.invoices[i].id;
        checkedVal.push(result);
      }
    }

    this.checkedValGet = checkedVal;
    checkedVal.length > 0 ? document.getElementById("remove-actions")?.classList.remove('d-none') : document.getElementById("remove-actions")?.classList.add('d-none');
  }
  // Select Checkbox value Get
  onCheckboxChange(e: any) {
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.invoices.length; i++) {
      if (this.invoices[i].states == true) {
        result = this.invoices[i].id;
        checkedVal.push(result);
      }
    }
    this.checkedValGet = checkedVal
    checkedVal.length > 0 ? document.getElementById("remove-actions")?.classList.remove('d-none') : document.getElementById("remove-actions")?.classList.add('d-none');
  }

  // Delete Product
  removeItem(id: any) {
    this.deleteID = id
    this.deleteRecordModal?.show()
  }

  deleteData(id: any) {
    this.deleteRecordModal?.hide();
    if (id) {
      this.store.dispatch(deleteinvoice({ id: this.deleteID.toString() }));
    }
    this.store.dispatch(deleteinvoice({ id: this.checkedValGet.toString() }));
    this.deleteRecordModal?.hide();
    this.masterSelected = false
  }

  // Page Changed
  pageChanged(event: any): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.invoices = this.invoiceslist
      .slice(startItem, endItem);
  }
}

