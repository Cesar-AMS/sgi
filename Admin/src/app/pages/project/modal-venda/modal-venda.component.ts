import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { debounceTime, distinctUntilChanged, filter, finalize, Subject, switchMap, tap } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { Act, Cliente, ContaReceberDto, Empreendimento, Filial, FormasPagamento, Installments, Sales, UnitsEnterprise, Usuarios } from 'src/app/models/ContaBancaria';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { number } from 'echarts';

export interface AtoItem {
  id: number;
  atoContrato?: number;    // R$
  dataAto: string;        // ISO yyyy-MM-dd
  valorAto?: number;       // R$
  formaPagamento?: number;
  status?: string; // ex.: À vista / 2x / 3x...
  editing?: boolean;        // controle da tabela
  obs?: string;
}


@Component({
  selector: 'app-modal-venda',
  templateUrl: './modal-venda.component.html',
  styleUrl: './modal-venda.component.scss',
})
export class ModalVendaComponent implements OnInit {

  constructor(private apiService: ApiService, private toast: ToastrService, private r2: Renderer2) {
    this.act.date = moment().format('YYYY-MM-DD')
  }

  @ViewChild('showModal', { static: false }) showModal!: ModalDirective;
  @ViewChild('showModalEl', { read: ElementRef }) showModalEl?: ElementRef<HTMLDivElement>;

  @ViewChild('modalPlanoCorretor', { static: false }) modalPlanoCorretor!: ModalDirective;
  @ViewChild('modalPlanoGerente', { static: false }) modalPlanoGerente!: ModalDirective;
  @ViewChild('modalPlanoCorretorEl', { read: ElementRef }) modalPlanoCorretorEl?: ElementRef<HTMLDivElement>;
  @ViewChild('modalPlanoGerenteEl', { read: ElementRef }) modalPlanoGerenteEl?: ElementRef<HTMLDivElement>;


  @Input() dados: Sales | undefined; // pode tipar com interface
   
  listAto: Act[] = [];
  act: Act = {} as Act;
  installaments: Installments[] = [];
  installamentsCorretor: Installments[] = [];
  installamentsGerente: Installments[] = [];

  installment: Installments = {} as Installments;
  intermediarias: Installments[] = [];
  intermed: Installments = {} as Installments;

  corretorDataInicialPagamento: string = '';
  corretorValorParcela?: number = undefined;
  corretorQtdeParcela?: number = undefined;

  gerenteDataInicialPagamento: string = '';
  gerenteValorParcela?: number = undefined;
  gerenteQtdeParcela?: number = undefined;


  model: Act = {
    id: 0,
    parcel: 0,
    value: 0,
    date: moment().format('YYYY-MM-DD'),
    observations: '',
    sourceId: 0,
    status: 'PAID',
    paymentId: 0,
    paidDate: undefined
  };


  clienteInput$ = new Subject<string>();

  clientes: Cliente[] = [];
  gerentes: Usuarios[] = [];
  corretores: Usuarios[] = [];
  coordenatorsAll: Usuarios[] = [];


  carregandoClientes = false;

  empreendimentos: Empreendimento[] = [];
  venda: Sales = {} as Sales;
  empreendimentoSelecionado: string = '';
  filiais: Filial[] = [];
  totalAto: number = 0;
  totalRestante: number = 0;
  formasPagamento: FormasPagamento[] = [];
  unidades: UnitsEnterprise[] = [];

  recalculate() {
    console.log('recalculte')

    this.totalAto = this.listAto.reduce((acc, item) => {
      return item.status === 'PAID' ? acc + Number(item.value || 0) : acc;
    }, 0);

    this.totalRestante = Number(this.venda.startValue) - Number(this.totalAto)

    this.setCommissionCorretor();
    this.setCommissionGerente();
  }


  addAto() {


    const novo: Act = { ...this.act, id: this.listAto?.length ?? 0 + 1 };


    this.listAto.push(novo);

    this.recalculate()

    if (this.totalRestante < 0) {
      this.toast.error('O Valor do Ato informado, supera o restante necessário.')
      return;
    }


    const data = this.act.date;

    this.act = {
      id: 0,
      parcel: 0,
      value: 0,
      date: data,
      observations: '',
      sourceId: 0,
      status: 'PAID',
      paymentId: 0,
      paidDate: undefined
    };


  }

  saveSales() {

    console.log('venda', this.venda)

    if (!this.venda.customerId) {
      this.toast.error('Informe um cliente para salvar uma venda')
      return
    }

    if (!this.venda.unitId) {
      this.toast.error('Selecione uma unidade para salvar.')
      return
    }

    this.venda.parcelas = this.installaments;
    this.venda.acts = this.listAto;
    this.venda.intermediarias = this.intermediarias;
    this.venda.plainCorretor = this.installamentsCorretor;
    this.venda.plainManager = this.installamentsGerente;

    //managerId
    
    this.venda.gerente = this.gerentes.find(g => +g.id === +this.venda.managerId)?.name ?? ''
    this.venda.corretor = this.corretores.find(c => +c.id === +this.venda.realtorId)?.name ?? ''


    this.apiService.createSale(this.venda).subscribe(() => {
      this.toast.success('Salvo com sucesso')
      
      if(this.modalPlanoGerente.isShown){ this.modalPlanoGerente.hide() }

      if(this.modalPlanoCorretor.isShown){ this.modalPlanoCorretor.hide() }

      if(this.showModal.isShown){ this.showModal.hide() }

    })
  }



  ngOnInit() {
    this.apiService.getEmpreendimentos().subscribe((data: Empreendimento[]) => {
      this.empreendimentos = data
    })

    

    this.clienteInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(term => {
          if (term && term.trim().length > 0) {
            this.carregandoClientes = true;
          } else {
            this.carregandoClientes = false;
          }
        }),
        filter(term => !!term && term.trim().length > 0),
        switchMap(term => this.apiService.getClientesByTerms(term).pipe(
          finalize(() => {
            this.carregandoClientes = false
          })
        ))
      )
      .subscribe((result: Cliente[]) => {
        console.log('result', result)
        this.clientes = result;
      });

    this.apiService.getFiliais().subscribe((data) => {
      var filial: Filial = {
        id: 99,
        name: 'Informe uma filial',
        address: '',
        status: true,
        phone: ''
      }

      data.push(filial)
      this.filiais = data;

      this.venda.branchId = 99
      this.venda.realtorComissionStatus = ''

    this.venda.status = 'WAITING'
    this.venda.realtorComissionStatus = 'WAITING'
    this.venda.managerComissionStatus = 'WAITING'
    this.venda.financialComissionStatus = 'WAITING'
    this.venda.percentageToFinancial = 0

    });

    this.apiService.getCorretores().subscribe((data) => {
      console.log('corretores', data)
      this.corretores = data
    });

    
    this.apiService.getCoordenadores().subscribe((data) => {
      this.coordenatorsAll = data
    });


    this.apiService.getGerentes().subscribe((data) => {
      this.gerentes = data
    });

    this.apiService.getFormasPagamento().subscribe((data) => {
      this.formasPagamento = data
    })

    this.venda.parcelsStart = moment().format('YYYY-MM-DD')
  
    console.log('dados chegam nok', this.dados)
    if(this.dados != undefined){
      console.log('dados chegam', this.dados)
      this.venda = this.dados
    }
  }

  getUnits() {
    this.unidades = []
    this.venda.unitValue = 0;

    this.apiService.getAllUnitsActiveByEnterprise(this.venda.enterpriseId).subscribe((data: UnitsEnterprise[]) => {
      this.unidades = data
    })
  }

  vlrRepassarfinancial() {
    this.venda.financialComission = Number((this.venda?.unitValue * ((this.venda?.percentageToFinancial ?? 0) / 100)).toFixed(2))
    this.recalculateLucro()
  }

  pctRepassarfinancial() {
    this.venda.percentageToFinancial = Number((this.venda.financialComission / this.venda?.unitValue).toFixed(2))
  
    this.recalculateLucro()
  }

  recalculateLucro(){
    this.venda.netEarnings = (this.venda.valueToRealstate ?? 0) -
                             (this.venda.realtorComission ?? 0) -
                             (this.venda.managerComission ?? 0) -
                             (this.venda.financialComission ?? 0)
  }

  setCliente() {
    let clienteSelecionada = this.clientes.find(cl => +cl.id === +this.venda.customerId);

    console.log('cliente Selecionado', clienteSelecionada)

    if (clienteSelecionada) {
      this.venda.emailCustomer = clienteSelecionada.email;
      this.venda.phoneCustomer = clienteSelecionada.cellphone;
      this.venda.cpfCnpj = clienteSelecionada.cpfCnpj;
    } else {

    }
  }

  ajustedComissionCorretor() {
    this.venda.realtorComission = Number((this.venda?.unitValue * ((this.venda.percentageToRealtor ?? 0)/100)).toFixed(2))
    
    this.recalculateLucro()
  }

  ajustedComissionGerente(){
    this.venda.realtorComission = Number((this.venda?.unitValue * ((this.venda.percentageToRealtor ?? 0) /100)).toFixed(2))
    this.recalculateLucro()
  }


  setCommissionCoordenador(){

  }


  setCommissionCorretor() {
    var corretor = this.corretores.filter(i => +i.id === +this.venda.realtorId)[0];

    console.log('corretor selecionado', corretor)

    if (corretor?.valueCommissioned === 100) {
      this.venda.realtorComission = 100;
      this.venda.percentageToRealtor = undefined;

      return;
    }

    if (this.venda?.startValue >= 5000) {
      this.venda.percentageToRealtor = Number(((corretor.valueCommissionedMax ?? 0) * 100).toFixed(2));
      this.venda.realtorComission = Number((this.venda?.unitValue * (corretor.valueCommissionedMax ?? 0)).toFixed(2));
    }
    else {
      this.venda.percentageToRealtor = Number(((corretor.valueCommissioned ?? 0) * 100).toFixed(2));
      this.venda.realtorComission = Number((this.venda?.unitValue * (corretor.valueCommissioned ?? 0)).toFixed(2));
    }

  }


  setCommissionGerente() {
    var gerente = this.gerentes.filter(g => +g.id === +this.venda.managerId)[0];

    if (this.venda.startValue >= 5000) {
      this.venda.percentageToManager = Number(((gerente.valueCommissionedMax ?? 0) * 100).toFixed(2));
      this.venda.managerComission = Number((this.venda?.unitValue * (gerente.valueCommissionedMax ?? 0)).toFixed(2));
    }
    else {
      this.venda.percentageToManager = Number(((gerente.valueCommissioned ?? 0) * 100).toFixed(2));
      this.venda.managerComission = Number((this.venda?.unitValue * (gerente.valueCommissioned ?? 0)).toFixed(2));
    }
  }

  realtorComission() {
    this.venda.percentageToRealtor = Number(((this.venda.realtorComission / this.venda?.unitValue).toFixed(2))) * 100;
    this.recalculateLucro()
  }

  managerComission() {
    this.venda.percentageToManager = Number((this.venda.managerComission / this.venda?.unitValue).toFixed(2)) * 100;
    this.recalculateLucro()
  }

  setUnitValue() {
    const unidadeSelecionada = this.unidades.find(ut => +ut.id === +this.venda.unitId);

    if (unidadeSelecionada) {
      this.venda.unitValue = unidadeSelecionada.value;
      this.venda.percentageToRealstate = (unidadeSelecionada.commission)
      this.venda.unitId = unidadeSelecionada.id;
      this.venda.valueToRealstate = Number((unidadeSelecionada.value * (unidadeSelecionada.commission / 100)).toFixed(2))
    } else {
      this.venda.unitValue = 0;
    }
  }

  listIntermed: any[] = []

  addIntermed() {


    var obj: Installments = {
      id: this.intermediarias?.length ?? 0 + 1,
      vlrInstallament: this.venda.vlIntermediaria,
      dueDate: this.venda.dtIntermediaria,
      dtPayment: undefined,
      obs: '',
      status: 'WAITING'
    }

    this.intermediarias.push(obj)
    //this.listIntermed.push({ ato: 1, vencimento: '23/07/2025', datePagamento: '15/12/2027', obs: 'teste', status: 'paga' })
  }

  addParcelaCorretor() {
    const novas: Installments[] = [];

    if (!this.corretorQtdeParcela || !this.corretorValorParcela) {
      return;
    }


    for (let i = 0; i < this.corretorQtdeParcela; i++) {

      var due = moment(this.corretorDataInicialPagamento).add((30 * (i + 1)), 'days').format('YYYY-MM-DD');

      console.log('due', due)

      var obj: Installments = {
        id: i + 1,
        vlrInstallament: this.corretorValorParcela,
        dueDate: due,
        dtPayment: undefined,
        obs: '',
        status: 'WAITING'
      }

      novas.push(obj);

    }

    this.installamentsCorretor = novas;
  }

  addParcelaGerente() {
    const novas: Installments[] = [];

    if (!this.gerenteQtdeParcela || !this.gerenteValorParcela) {
      return;
    }


    for (let i = 0; i < this.gerenteQtdeParcela; i++) {

      var due = moment(this.gerenteDataInicialPagamento).add((30 * (i + 1)), 'days').format('YYYY-MM-DD');

      console.log('due', due)

      var obj: Installments = {
        id: i + 1,
        vlrInstallament: this.gerenteValorParcela,
        dueDate: due,
        dtPayment: undefined,
        obs: '',
        status: 'WAITING'
      }

      novas.push(obj);

    }

    this.installamentsGerente = novas;
  }

addParcela() {
  const novas: Installments[] = [];

  const start = moment(this.venda.parcelsStart, ['YYYY-MM-DD', moment.ISO_8601], true);
  if (!start.isValid()) {
    console.error('parcelsStart inválido:', this.venda.parcelsStart);
    return;
  }

  const diaBase = start.date();

  const primeiraNoMesAtual = true;

  for (let i = 0; i < this.venda.qtdeParcelas; i++) {
    const meses = primeiraNoMesAtual ? i : i + 1;

    const alvo = start.clone().add(meses, 'months');

    const ultimoDia = alvo.daysInMonth();

    const due = alvo.date(Math.min(diaBase, ultimoDia)).format('YYYY-MM-DD');

    const obj: Installments = {
      id: i + 1,
      vlrInstallament: this.venda.vlrAtoReference,
      dueDate: due,
      dtPayment: undefined,
      obs: '',
      status: 'WAITING'
    };

    novas.push(obj);
  }

  console.table(novas);

  this.installaments = novas;
}

  disableInputs = false

  show(disabled: boolean) {
    this.disableInputs = disabled
    this.showModal?.show();
  }



  hide() {
    this.showModal?.hide();
  }

  idCounter: number = 0
  //--
  adicionar() {
    const novo: Act = {
      ...this.model,
    };
    this.listAto.push(novo);

  }


  remover(id: number) {
    this.listAto = this.listAto.filter(x => x.id !== id);

    this.recalculate()
  }

  trackById = (_: number, it: Act) => it.id;

  trackByNro = (_: number, p: Installments) => p.id;

  trackByNroIntermed = (_: number, p: Installments) => p.id;

  private setHidden(el?: ElementRef<HTMLElement>, hidden = true, displayValue = 'block') {
    if (!el) return;
    if (hidden) {
      this.r2.setStyle(el.nativeElement, 'display', 'none');
    } else {
      this.r2.setStyle(el.nativeElement, 'display', displayValue); // força block quando precisa
    }
  }

  private showOnly(target: 'show' | 'corretor' | 'gerente') {
    const map = {
      show: { dir: this.showModal, el: this.showModalEl },
      corretor: { dir: this.modalPlanoCorretor, el: this.modalPlanoCorretorEl },
      gerente: { dir: this.modalPlanoGerente, el: this.modalPlanoGerenteEl }
    };


    this.setHidden(this.showModalEl, true);
    this.setHidden(this.modalPlanoCorretorEl, true);
    this.setHidden(this.modalPlanoGerenteEl, true);

    const targetDir = map[target].dir;
    const targetEl = map[target].el;

     if ((targetDir as any)?.isShown) {
      this.setHidden(targetEl, false, 'block'); // volta a aparecer
    } else {
      this.setHidden(targetEl, false, 'block');
      targetDir.show();
    }
  }

  irParaCorretor() { this.showOnly('corretor'); }
  irParaGerente() { this.showOnly('gerente'); }
  voltarParaShowModal() { this.showOnly('show'); }

    adicionarc() { console.log('Abrir modal de cadastro'); }
    editar(row: ContaReceberDto) { console.log('Editar', row); }
    excluir(row: ContaReceberDto) { console.log('Excluir', row); }
}
