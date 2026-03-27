import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as moment from 'moment';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { AccountBank, AccountPlains, Cargos, Categories, CentroCusto, Cliente, ContaPagarDto, ContaReceberDto, Filial, Lancamento } from 'src/app/models/ContaBancaria';
import { FinancialEntry } from 'src/app/pages/dashboards/crm/crm.component';
import { ExportExcelService } from 'src/app/shared/export-excel.service';


type SortKey = keyof Pick<ContaPagarDto, 'createdAt' | 'dueDate' | 'description' | 'clientName' | 'accountName' | 'categoryName' | 'centerCoustName' | 'amount'
>;

@Component({
  selector: 'app-contas-receber',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, ModalModule],
  templateUrl: './contas-receber.component.html',
  styleUrl: './contas-receber.component.scss'
})
export class ContasReceberComponent implements OnInit {

  
    @ViewChild('grid2', { static: false }) modalContasReceber?: ModalDirective;
    @ViewChild('grid3', { static: false }) modalContasPagar?: ModalDirective;
    
     categories: Categories[] = []
      centrosCusto: CentroCusto[] = [];
       filiais: Filial[] = [];
       cargos: Cargos[] = [];
       planAcc: AccountPlains[] = []
        accountsBank: AccountBank[] = []
        breadCrumbItems!: Array<{}>;
        
       
      accountsBankActive: AccountBank[] = []
      
  constructor(private excel: ExportExcelService, private service: ApiService, private toast: ToastrService) {

  }

   activeTab: 'dados' | 'recorrencia' | 'adicionais' | 'documentos' = 'dados';

    periodos = [
    { value: 'DAILY', label: 'Diário' },
    { value: 'WEEKLY', label: 'Semanal' },
    { value: 'MONTHLY', label: 'Mensal' },
    { value: 'YEARLY', label: 'Anual' },
  ];


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

    

  ngOnInit() {
    this.filtrar()

    
    this.breadCrumbItems = [
      { label: 'Dashboards' },
      { label: 'CRM', active: true }
    ];

  this.service.getCentroCusto().subscribe((data) => {
      this.centrosCusto = data
    })

    this.service.getClientes().subscribe({
      next: (data) => {
           this.clientes = data;
      },
      error: () => {
       
      },
      complete: () => {
      
      },
    });

    this.service.getAccBnk().subscribe((data) => {
      this.accountsBankActive = data.filter((n) => n.active === true)
    })

    this.service.getCategoriesActives().subscribe((data: any) => {
      this.categories = data;
    });

  }

   setTab(t: typeof this.activeTab) { this.activeTab = t; }

   clientes: Cliente[] = [];

  categoriaFilter: string = '9999'
  typeFilter: string = 'due';

  dtIni: string = moment().add(-15, 'days').format('YYYY-MM-DD');
  dtFim: string = moment().format('YYYY-MM-DD');

  search = '';

  lancamentos: ContaReceberDto[] = [];

  // seleção / ordenação
  selected = new Set<number>();
  sortKey: SortKey = 'dueDate';
  sortDir: 1 | -1 = -1;

  // computados


  get total(): number {
    return this.lancamentos.reduce((sum, r) => sum + r.amount, 0);
  }

  // badges (ex: 1 filtro ativo, 9 selecionados)
  get activeFiltersCount(): number {
    let n = 0;
    if (this.dtIni) n++;
    if (this.dtFim) n++;
    if (this.search.trim()) n++;
    return n;
  }
  get selectedCount(): number { return this.selected.size; }

  toggleAll(checked: boolean) {
    this.selected.clear();
    if (checked) this.lancamentos.forEach(r => this.selected.add(r.id));
  }
  toggleRow(id: number, checked: boolean) {
    checked ? this.selected.add(id) : this.selected.delete(id);
  }

  sortBy(k: SortKey) {
    if (this.sortKey === k) this.sortDir = this.sortDir === 1 ? -1 : 1;
    else { this.sortKey = k; this.sortDir = 1; }
  }

  filtrar() {

    this.service.getReceivablePeriodo(this.dtIni, this.dtFim, this.typeFilter, this.categoriaFilter).subscribe((data) => {
      this.lancamentos = data
    })
  }


  exportarExcel(): void {
    const data = this.lancamentos.map(e => ({
      'Descrição': e.description,
      'Cliente': e.clientName,
      'Conta': e.accountName,
      'Categoria': e.categoryName,
      'Centro de Custo': e.centerCoustName,
      'Valor': e.amount
    }));

    this.excel.exportJson(data, 'Contas a pagar');
  }
  adicionar() { console.log('Abrir modal de cadastro'); }
  excluir(row: ContaReceberDto) { console.log('Excluir', row); }

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


  recebimentoSelecionado: any = null;

// formulário do modal de recebimento
receberForm = {
  dataRecebimento: new Date().toISOString().substring(0,10),
  accountId: null as number | null,
  amount: 0
};

// abrir modal de recebimento (é chamado pelo botão)
marcarRecebido(r: any) {
  this.recebimentoSelecionado = { ...r }; // clone
  this.receberForm = {
    dataRecebimento: new Date().toISOString().substring(0,10),
    accountId: r.accountId || null,
    amount: r.amount || 0
  };
}

// abrir modal de edição (é chamado pelo botão)
editar(r: any) {
  this.recebimentoSelecionado = { ...r }; // clone para não mutar a lista até salvar
}

// confirma salvar edição
confirmarEditarReceber() {
  const p = this.recebimentoSelecionado;
  const payload = {
    id: p.id,
    dueDate: p.dueDate,
    amount: p.amount,
    description: p.description,
    categoryId: p.categoryId,
    accountId: p.accountId,
    costCenterId: p.costCenterId,
    notes: p.notes
  };

  this.service.updateReceived(payload.id, payload).subscribe({
    next: () => {
      const idx = this.lancamentos.findIndex((x:any) => x.id === payload.id);
      if (idx >= 0) this.lancamentos[idx] = { ...this.recebimentoSelecionado };
      this.toast?.success?.('Lançamento atualizado!');
    },
    error: (e) => this.toast?.error?.('Erro ao atualizar: ' + (e?.message || e))
  });
}

// confirma marcar como recebido
confirmarReceber() {
  const body = {
    id: this.recebimentoSelecionado.id,
    receivedDate: this.receberForm.dataRecebimento,
    accountId: this.receberForm.accountId,
    amount: Number(this.receberForm.amount || 0)
  };

  this.service.markAsReceived(body.id, body).subscribe({
    next: () => {
      const idx = this.lancamentos.findIndex((x:any) => x.id === body.id);
      if (idx >= 0) {
        this.lancamentos[idx] = {
          ...this.lancamentos[idx],
          received: true,
          receivedDate: body.receivedDate,
          amount: body.amount
        };
      }
      this.toast?.success?.('Recebimento confirmado!');
    },
    error: (e) => this.toast?.error?.('Erro ao confirmar recebimento: ' + (e?.message || e))
  });
}
}
