import { ModalDirective } from 'ngx-bootstrap/modal';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { getChartColorsArray, shuffleArray } from 'src/app/shared/commonFunction';
import { Store } from '@ngrx/store';
import { fetchdealData, fetchleadData, fetchtableData, fetchtaksData } from 'src/app/store/CRM/crm.actions';
import { selectabledata, selectdealData, selectleadData, selecttaskdata } from 'src/app/store/CRM/crm-selector';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { AccountBank, AccountPlains, CentroCusto, Cargos, Categories, ContaBancaria, ContaReceber, ContaReceberForm, Filial } from 'src/app/models/ContaBancaria';
import { ApiService } from 'src/app/core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

// models/financial-entry.model.ts

export interface FinancialEntry {
  id: number | null;
  seriesId: number | null;
  installmentNo: number | null;          // número da parcela
  amount: number | null;                 // valor
  description: string | null;            // descrição
  competenceDate: string | Date | null;  // data de competência
  dueDate: string | Date | null;         // vencimento
  received: boolean | null;              // recebido?
  receivedDate: string | Date | null;    // data de recebimento
  categoryId: number | null;             // categoria (FK)
  accountId: number | null;              // conta (FK)
  clientId: number | null;               // cliente (FK)
  costCenterId: number | null;           // centro de custo (FK)
  reference: string | null;              // referência (ex: NF, pedido)
  notes: string | null;                  // observações
  createdAt: string | Date | null;       // criado em
  updatedAt: string | Date | null;       // atualizado em
  deletedAt: string | Date | null;       // deletado em (soft delete)
  recurrencing: boolean | null;          // recorrente?
  periodic: string | null;               // periodicidade (ex.: 'monthly', 'weekly'...)
  parcelas: number | null;               // quantidade de parcelas
}


@Component({
  selector: 'app-crm',
  templateUrl: './crm.component.html',
  styleUrls: ['./crm.component.scss'],
  providers: [DecimalPipe,

  ]
})
export class CrmComponent {

  @ViewChild('grid', { static: false }) modalCadastro?: ModalDirective;
  @ViewChild('grid2', { static: false }) modalContasReceber?: ModalDirective;
  @ViewChild('grid3', { static: false }) modalContasPagar?: ModalDirective;

  activeTab: 'dados' | 'recorrencia' | 'adicionais' | 'documentos' = 'dados';

  filiais: Filial[] = [];
  cargos: Cargos[] = [];
  categories: Categories[] = []
  planAcc: AccountPlains[] = []

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  novaconta: AccountBank = {} as AccountBank;
  accountsBank: AccountBank[] = []
  statedata: any;
  dealList: any
  realizedChart: any;
  balance_overviewChart: any;
  emailSentChart: any;
  usersActivityChart: any;
  syncStatusBreakdownChart: any;
  taskList: any
  contact: any;
  leadlist: any;
  endItem: any
  contaB: ContaBancaria = {
    nome: '',
    ativa: true,
    saldoInicial: null,
    numeroConta: null,
    agencia: null,
    tipoChavePix: null,
    chavePix: null,
  };

  tiposPix = [
    { value: 'cpf', label: 'CPF' },
    { value: 'cnpj', label: 'CNPJ' },
    { value: 'email', label: 'E-mail' },
    { value: 'celular', label: 'Celular' },
    { value: 'aleatoria', label: 'Chave aleatória' },
  ] as const;

  contasaReceber: ContaReceberForm = {
    valor: null,
    jaRecebido: false,
    dataRecebimento: null,
    descricao: null,
    categoria: null,
    conta: null,
    dataCompetencia: null,
    dataVencimento: null,
    cliente: null,
    centroCusto: null,
    referencia: null,
    anotacoes: null,
    usarRecorrencia: false,
    periodoRecorrencia: null,
    parcelas: null,
    recebimentoFixo: false,
    documentos: []
  };

  accountsReceivable: FinancialEntry = {
    id: null,
    seriesId: null,
    installmentNo: null,
    amount: null,
    description: null,
    competenceDate: null, // hoje
    dueDate: null,        // hoje
    received: null,
    receivedDate: null,                          // vazio quando não recebido
    categoryId: null,
    accountId: null,
    clientId: null,
    costCenterId: null,
    reference: null,
    notes: null,
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    recurrencing: null,
    periodic: null,
    parcelas: null
  };

  financialReceibled: FinancialEntry[] = [];
  financialPayable: FinancialEntry[] = [];


  categorias = [{ id: 1, nome: 'Comissão' }, { id: 2, nome: 'Aluguel' }];
  contas = [{ id: 10, nome: 'Banco XP' }, { id: 11, nome: 'Caixa' }];
  clientes = [{ id: 100, nome: 'João' }, { id: 101, nome: 'Maria' }];
  centrosCusto: CentroCusto[] = [];
  periodos = [
    { value: 'DAILY', label: 'Diário' },
    { value: 'WEEKLY', label: 'Semanal' },
    { value: 'MONTHLY', label: 'Mensal' },
    { value: 'YEARLY', label: 'Anual' },
  ];

  setTab(t: typeof this.activeTab) { this.activeTab = t; }

  onUploadChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;
    for (const f of Array.from(input.files)) {
      this.contasaReceber.documentos!.push({ nome: f.name, tamanho: f.size, data: new Date() });
    }
    input.value = '';
  }

  addeContinua() {

    this.service.postReceivables(this.accountsReceivable).subscribe(() => {
      this.toast.success('Salvo com sucesso!', 'Continue.. ')
      this.accountsReceivable.id = null,
        this.accountsReceivable.seriesId = null,
        this.accountsReceivable.installmentNo = null,
        this.accountsReceivable.amount = 0,
        this.accountsReceivable.description = null,
        this.accountsReceivable.competenceDate = null,
        this.accountsReceivable.dueDate = null,
        this.accountsReceivable.received = null,
        this.accountsReceivable.receivedDate = null,
        this.accountsReceivable.categoryId = null,
        this.accountsReceivable.costCenterId = null,
        this.accountsReceivable.reference = null,
        this.accountsReceivable.notes = null,
        this.accountsReceivable.createdAt = null,
        this.accountsReceivable.updatedAt = null,
        this.accountsReceivable.deletedAt = null,
        this.accountsReceivable.recurrencing = null,
        this.accountsReceivable.periodic = null,
        this.accountsReceivable.parcelas = null
    })

  }

  addeFecha() {
    console.log('Conta salva: e fecha', this.conta);
    console.log('Conta salva: e continua', this.conta);

    this.service.postReceivables(this.accountsReceivable).subscribe(() => {
      this.toast.success('Salvo com sucesso!', 'Continue.. ')
      this.accountsReceivable.id = null,
        this.accountsReceivable.seriesId = null,
        this.accountsReceivable.installmentNo = null,
        this.accountsReceivable.amount = 0,
        this.accountsReceivable.description = null,
        this.accountsReceivable.competenceDate = null,
        this.accountsReceivable.dueDate = null,
        this.accountsReceivable.received = null,
        this.accountsReceivable.receivedDate = null,
        this.accountsReceivable.categoryId = null,
        this.accountsReceivable.costCenterId = null,
        this.accountsReceivable.reference = null,
        this.accountsReceivable.notes = null,
        this.accountsReceivable.createdAt = null,
        this.accountsReceivable.updatedAt = null,
        this.accountsReceivable.deletedAt = null,
        this.accountsReceivable.recurrencing = null,
        this.accountsReceivable.periodic = null,
        this.accountsReceivable.parcelas = null
    })

    this.modalContasReceber?.hide()
  }

  addeContinuaPagar() {
    console.log('Conta salva: e continua', this.conta);
    this.service.postPayable(this.contaPagar).subscribe(() => {
      this.toast.success('Salvo com sucesso!', 'Continue.. ')
      this.contaPagar.id = null,
        this.contaPagar.seriesId = null,
        this.contaPagar.installmentNo = null,
        this.contaPagar.amount = 0,
        this.contaPagar.description = null,
        this.contaPagar.competenceDate = null,
        this.contaPagar.dueDate = null,
        this.contaPagar.received = null,
        this.contaPagar.receivedDate = null,
        this.contaPagar.categoryId = null,
        this.contaPagar.costCenterId = null,
        this.contaPagar.reference = null,
        this.contaPagar.notes = null,
        this.contaPagar.createdAt = null,
        this.contaPagar.updatedAt = null,
        this.contaPagar.deletedAt = null,
        this.contaPagar.recurrencing = null,
        this.contaPagar.periodic = null,
        this.contaPagar.parcelas = null
    })
  }

  addeFechaPagar() {
    console.log('Conta salva: e continua', this.conta);
    this.service.postPayable(this.contaPagar).subscribe(() => {
      this.toast.success('Salvo com sucesso!', 'Continue.. ')
      this.contaPagar.id = null,
        this.contaPagar.seriesId = null,
        this.contaPagar.installmentNo = null,
        this.contaPagar.amount = 0,
        this.contaPagar.description = null,
        this.contaPagar.competenceDate = null,
        this.contaPagar.dueDate = null,
        this.contaPagar.received = null,
        this.contaPagar.receivedDate = null,
        this.contaPagar.categoryId = null,
        this.contaPagar.costCenterId = null,
        this.contaPagar.reference = null,
        this.contaPagar.notes = null,
        this.contaPagar.createdAt = null,
        this.contaPagar.updatedAt = null,
        this.contaPagar.deletedAt = null,
        this.contaPagar.recurrencing = null,
        this.contaPagar.periodic = null,
        this.contaPagar.parcelas = null

      this.modalContasPagar?.hide()
    })

  }

  onSubmitContasaReceber() {
    console.log('Dados enviados:', this.conta);
  }

  // transforma "yyyy-MM-dd" -> ISO "yyyy-MM-ddTHH:mm:ss.sssZ"
  private toIsoOrNull(d: string | null): string | null {
    return d ? new Date(d + 'T00:00:00').toISOString() : null;
  }

  conta: AccountBank = {
    id: 0,
    description: '',
    amount: 0,
    active: true,
    account: '',
    agency: '',
    amountActual: 0,
    createAt: moment().format(),
    userId: 0,
    type_key: '',
    key_value: ''
  };

  contaPagar: FinancialEntry = {
    id: null,
    seriesId: null,
    installmentNo: null,
    amount: null,
    description: null,
    competenceDate: null, // hoje
    dueDate: null,        // hoje
    received: null,
    receivedDate: null,                          // vazio quando não recebido
    categoryId: null,
    accountId: null,
    clientId: null,
    costCenterId: null,
    reference: null,
    notes: null,
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    recurrencing: null,
    periodic: null,
    parcelas: null
  };


  contaReceber: any = {
    id: 0,
    seriesId: 0,
    installmentNo: 0,
    amount: 0,
    description: '',
    competenceDate: '',
    dueDate: '',
    received: false,
    receivedDate: '',
    categoryId: null,
    accountId: null,
    clientId: null,
    costCenterId: null,
    reference: '',
    notes: '',
    createdAt: '',
    updatedAt: '',
    deletedAt: '',
    recurrencing: false,
    periodic: '',
    parcelas: 0,
    documentos: []
  };

  sortValue: any = 'Leads Score';

  saveAccount() {
    this.service.createAccBnk(this.conta).subscribe(() => {
      this.toast.success('Conta criada com sucesso')

      this.service.getAccBnk().subscribe((data) => {
        this.accountsBank = data
        this.modalCadastro?.hide()
      })
    })
  }

  accountsBankActive: AccountBank[] = []

  constructor(public store: Store, private service: ApiService, private toast: ToastrService) { }

  ngOnInit() {

    this.service.getReceivables().subscribe((data) => {
      this.financialReceibled = data
    })

    this.service.getPayable().subscribe((data) => {
      this.financialPayable = data
    })

    this.service.getAccBnk().subscribe((data) => {
      this.accountsBank = data
      this.accountsBankActive = data.filter((n) => n.active === true)
    })

    this.breadCrumbItems = [
      { label: 'Dashboards' },
      { label: 'CRM', active: true }
    ];

    this.service.getFiliais().subscribe((data) => {
      this.filiais = data;
    });

    this.service.getCentroCusto().subscribe((data) => {
      this.centrosCusto = data
    })

    this.service.getCargos().subscribe((data) => {
      this.cargos = data;
    });

    this.service.getCategories().subscribe((data: any) => {
      this.categories = data;
    });

    this.service.getAccPlan().subscribe((data: any) => {
      this.planAcc = data;
    });

    // store
    this.store.dispatch(fetchtableData());
    this.store.select(selectabledata).subscribe((data) => {
      this.statedata = data;
    });
    this.store.dispatch(fetchleadData());

    this.store.dispatch(fetchdealData());
    this.store.select(selectdealData).subscribe((data) => {
      this.dealList = data;
    });
    this.store.dispatch(fetchtaksData());
    this.store.select(selecttaskdata).subscribe((data) => {
      this.taskList = data;
    });


    // Chart Color Data Get Function
    this._realizedChart('["--tb-primary", "--tb-secondary", "--tb-danger"]');
    this._balance_overviewChart('["--tb-primary", "--tb-light","--tb-secondary"]');
    this._emailSentChart('["--tb-primary", "--tb-success", "--tb-secondary"]');
    this._usersActivityChart('["--tb-primary", "--tb-light"]');
    this._syncStatusBreakdownChart('["--tb-primary", "--tb-primary-rgb, 0.85", "--tb-primary-rgb, 0.60", "--tb-primary-rgb, 0.50", "--tb-info"]');
  }

  /**
* Realized Charts
*/
  changerealizedValue() {
    var readSeries = [80, 50, 30, 40, 100, 20]
    const shuffledvisitorSeries = [...readSeries];
    shuffleArray(shuffledvisitorSeries);

    var deliverySeries = [20, 30, 40, 80, 20, 80]
    const shuffledreturnSeries = [...deliverySeries];
    shuffleArray(shuffledreturnSeries);

    var failedSeries = [44, 76, 78, 13, 43, 10]
    const shuffledfailedSeries = [...failedSeries];
    shuffleArray(shuffledreturnSeries);

    setTimeout(() => {
      this.realizedChart.series = [{
        name: 'Read',
        data: shuffledvisitorSeries
      },
      {
        name: 'Delivery',
        data: shuffledreturnSeries
      },
      {
        name: 'Failed',
        data: shuffledfailedSeries
      }
      ];
    }, 500);
  }

  private _realizedChart(colors: any) {
    colors = getChartColorsArray(colors);
    this.realizedChart = {
      series: [{
        name: 'Read',
        data: [80, 50, 30, 40, 100, 20],
      },
      {
        name: 'Delivery',
        data: [20, 30, 40, 80, 20, 80],
      },
      {
        name: 'Failed',
        data: [44, 76, 78, 13, 43, 10],
      }
      ],
      chart: {
        height: 403,
        type: 'radar',
        toolbar: {
          show: false
        },
      },
      stroke: {
        width: 1
      },
      fill: {
        opacity: 0.2
      },
      markers: {
        size: 3,
        hover: {
          size: 4,
        }
      },
      colors: colors,
      xaxis: {
        categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
      }
    }

    const attributeToMonitor = 'data-theme';

    const observer = new MutationObserver(() => {
      this._realizedChart('["--tb-primary", "--tb-secondary", "--tb-danger"]');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [attributeToMonitor]
    });
  }

  /**
* Balance Overview Charts
*/

  changebalanceValue() {
    var revenueSeries = [49, 62, 55, 67, 73, 89, 110, 120, 115, 129, 123, 133]
    const shuffledrevenueSeries = [...revenueSeries];
    shuffleArray(shuffledrevenueSeries);

    var expenseSeries = [62, 76, 67, 49, 63, 77, 70, 86, 92, 103, 87, 93]
    const shuffledexpenseSeries = [...expenseSeries];
    shuffleArray(shuffledexpenseSeries);

    var ratioSeries = [12, 36, 29, 33, 37, 42, 58, 67, 49, 33, 24, 18]
    const shuffledratioSeries = [...ratioSeries];
    shuffleArray(shuffledratioSeries);

    setTimeout(() => {
      this.balance_overviewChart.series = [{
        name: 'Total Revenue',
        data: shuffledrevenueSeries
      },
      {
        name: 'Total Expense',
        data: shuffledexpenseSeries
      },
      {
        name: 'Profit Ratio',
        data: shuffledratioSeries
      }
      ];
    }, 500);
  }

  private _balance_overviewChart(colors: any) {
    colors = getChartColorsArray(colors);
    this.balance_overviewChart = {
      series: [{
        name: 'Fluxo de Caixa',
        data: [49, 62, 55, 67, 73, 89, 110, 120, 115, 129, 123, 133]
      }],
      chart: {
        height: 300,
        type: 'line',
        toolbar: {
          show: false
        },
        dropShadow: {
          enabled: true,
          enabledOnSeries: undefined,
          top: 0,
          left: 0,
          blur: 3,
          color: colors,
          opacity: 0.25
        }
      },
      markers: {
        size: 0,
        strokeColors: colors,
        strokeWidth: 2,
        strokeOpacity: 0.9,
        fillOpacity: 1,
        radius: 0,
        hover: {
          size: 5,
        }
      },
      grid: {
        show: true,
        padding: {
          top: -20,
          right: 0,
          bottom: 0,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        labels: {
          rotate: -90
        },
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          stroke: {
            width: 1
          },
        },
      },
      stroke: {
        width: [2, 2, 2],
        curve: 'smooth'
      },
      colors: colors,
    }

    const attributeToMonitor = 'data-theme';

    const observer = new MutationObserver(() => {
      this._balance_overviewChart('["--tb-primary", "--tb-light","--tb-secondary"]');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [attributeToMonitor]
    });
  }

  /**
* Email sent Charts
*/

  changeEmailchart() {
    var emailSeries = [63, 87, 33]
    const shuffledemailSeries = [...emailSeries];
    shuffleArray(shuffledemailSeries);

    setTimeout(() => {
      this.emailSentChart.series = shuffledemailSeries
    }, 500);
  }

  private _emailSentChart(colors: any) {
    colors = getChartColorsArray(colors);
    this.emailSentChart = {
      series: [63, 87, 33],
      chart: {
        height: 363,
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          track: {
            background: colors,
            opacity: 0.15,
          },
          dataLabels: {
            name: {
              fontSize: '22px',
            },
            value: {
              fontSize: '16px',
              color: "#87888a",
            },
            total: {
              show: true,
              label: 'Total',
              formatter: function (w: any) {
                return 1793
              }
            }
          },
        }
      },
      legend: {
        show: true,
        position: 'bottom',
      },
      labels: ['Sent', 'Received', 'Failed'],
      colors: colors,
    }

    const attributeToMonitor = 'data-theme';

    const observer = new MutationObserver(() => {
      this._emailSentChart('["--tb-primary", "--tb-success", "--tb-secondary"]');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [attributeToMonitor]
    });
  }

  /**
* User Activity Charts
*/
  changeActivity() {
    var ActiveSeries = [44, 55, 41, 67, 22, 43]
    const shuffledActivSeries = [...ActiveSeries];
    shuffleArray(shuffledActivSeries);

    var NewSeries = [13, 23, 20, 8, 13, 27]
    const shuffledNewSeries = [...NewSeries];
    shuffleArray(shuffledNewSeries);

    setTimeout(() => {
      this.usersActivityChart.series = [{
        name: 'Activ User',
        data: shuffledActivSeries
      }, {
        name: 'New Users',
        data: shuffledNewSeries
      }]
    }, 500);
  }

  private _usersActivityChart(colors: any) {
    colors = getChartColorsArray(colors);
    this.usersActivityChart = {
      series: [{
        name: 'Activ User',
        data: [44, 55, 41, 67, 22, 43]
      }, {
        name: 'New Users',
        data: [13, 23, 20, 8, 13, 27]
      }],
      chart: {
        type: 'bar',
        height: 330,
        stacked: true,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: true
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '40%',
        },
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      },
      grid: {
        show: true,
        padding: {
          top: -18,
          right: 0,
          bottom: 0,
        },
      },
      legend: {
        position: 'bottom',
      },
      fill: {
        opacity: 1
      },
      colors: colors,
    }

    const attributeToMonitor = 'data-theme';

    const observer = new MutationObserver(() => {
      this._usersActivityChart('["--tb-primary", "--tb-light"]');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [attributeToMonitor]
    });
  }

  /**
* User Activity Charts
*/
  changeStatuschart() {
    var SyncSeries = [44, 55, 41, 37, 22, 43, 21]
    const shuffledSyncSeries = [...SyncSeries];
    shuffleArray(shuffledSyncSeries);

    var NeededSeries = [53, 32, 33, 52, 13, 43, 32]
    const shuffledNeededSeries = [...NeededSeries];
    shuffleArray(shuffledNeededSeries);

    var NeverSeries = [12, 17, 11, 9, 15, 11, 20]
    const shuffledNeverSeries = [...NeverSeries];
    shuffleArray(shuffledNeverSeries);

    var ReviewSeries = [9, 7, 5, 8, 6, 9, 4]
    const shuffledReviewSeries = [...ReviewSeries];
    shuffleArray(shuffledReviewSeries);

    setTimeout(() => {
      this.syncStatusBreakdownChart.series = [{
        name: 'Synced',
        data: shuffledSyncSeries
      }, {
        name: 'Sync Needed',
        data: shuffledNeededSeries
      }, {
        name: 'Never Synced',
        data: shuffledNeverSeries
      }, {
        name: 'Review Needed',
        data: shuffledReviewSeries
      }]
    }, 500);
  }

  private _syncStatusBreakdownChart(colors: any) {
    colors = getChartColorsArray(colors);
    this.syncStatusBreakdownChart = {
      series: [{
        name: 'Synced',
        data: [44, 55, 41, 37, 22, 43, 21]
      }, {
        name: 'Sync Needed',
        data: [53, 32, 33, 52, 13, 43, 32]
      }, {
        name: 'Never Synced',
        data: [12, 17, 11, 9, 15, 11, 20]
      }, {
        name: 'Review Needed',
        data: [9, 7, 5, 8, 6, 9, 4]
      }],
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
        toolbar: {
          show: false,
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnHight: '40%',
        },
      },
      grid: {
        show: true,
        padding: {
          top: -20,
          right: 0,
          bottom: -10,
        },
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
      },
      yaxis: {
        title: {
          text: undefined
        },
      },
      fill: {
        opacity: 1
      },
      legend: {
        show: false,
      },
      colors: colors,
    }

    const attributeToMonitor = 'data-theme';

    const observer = new MutationObserver(() => {
      this._syncStatusBreakdownChart('["--tb-primary", "--tb-primary-rgb, 0.85", "--tb-primary-rgb, 0.60", "--tb-primary-rgb, 0.50", "--tb-info"]');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [attributeToMonitor]
    });
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    this.contact = this.leadlist.slice(startItem, this.endItem);
  }

  direction: any = 'asc';

  sortKey?: keyof FinancialEntry;
  sortDir: 'asc' | 'desc' = 'asc';

  sort(col: keyof FinancialEntry) {
    this.sortDir = this.sortKey === col && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortKey = col;

    this.financialReceibled = [...this.financialReceibled].sort((a, b) => {
      const A = a[col] as any;
      const B = b[col] as any;
      const res = A > B ? 1 : A < B ? -1 : 0;
      return this.sortDir === 'asc' ? res : -res;
    });
  }


  arrow(col: any) {
    if (this.sortKey !== col) return '';
    return this.sortDir === 'asc' ? '▲' : '▼';
  }

  private compare(a: any, b: any) {
    if (a == null && b == null) return 0;
    if (a == null) return 1;        // nulos no fim
    if (b == null) return -1;

    // tenta tratar data em string
    const aDate = typeof a === 'string' && !isNaN(Date.parse(a)) ? new Date(a).getTime() : a;
    const bDate = typeof b === 'string' && !isNaN(Date.parse(b)) ? new Date(b).getTime() : b;

    return aDate > bDate ? 1 : aDate < bDate ? -1 : 0;
  }
}
