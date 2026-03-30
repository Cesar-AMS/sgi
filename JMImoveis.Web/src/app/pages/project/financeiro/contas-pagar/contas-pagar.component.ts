import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountBank, Categories, CentroCusto, Cliente, ContaPagarDto, Lancamento } from 'src/app/models/ContaBancaria';
import { CommonModule } from '@angular/common';
import { ExportExcelService } from 'src/app/shared/export-excel.service';
import { ApiService } from 'src/app/core/services/api.service';
import * as moment from 'moment';
import { FinancialEntry } from 'src/app/pages/dashboards/crm/crm.component';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';


type SortKey = keyof Pick<ContaPagarDto, 'createdAt' | 'dueDate' | 'description' | 'clientName' | 'accountName' | 'categoryName' | 'centerCoustName' | 'amount'
>;

@Component({
  selector: 'app-contas-pagar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ModalModule],
  templateUrl: './contas-pagar.component.html',
  styleUrl: './contas-pagar.component.scss'
})



export class ContasPagarComponent implements OnInit {
  ngOnInit() {

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

    this.filtrar()
  }

  @ViewChild('grid3', { static: false }) modalContasPagar?: ModalDirective;

  categorias = [{ id: 1, nome: 'Comissão' }, { id: 2, nome: 'Aluguel' }];
  contas = [{ id: 10, nome: 'Banco XP' }, { id: 11, nome: 'Caixa' }];
  clientes: Cliente[] = [];
  centrosCusto: CentroCusto[] = [];
  categories: Categories[] = []
  accountsBankActive: AccountBank[] = []

  categoriaFilter: string = '9999'
  typeFilter: string = 'due';

  periodos = [
    { value: 'DAILY', label: 'Diário' },
    { value: 'WEEKLY', label: 'Semanal' },
    { value: 'MONTHLY', label: 'Mensal' },
    { value: 'YEARLY', label: 'Anual' },
  ];



  dtIni: string = moment().add(-15, 'days').format('YYYY-MM-DD');
  dtFim: string = moment().format('YYYY-MM-DD');

  search = '';

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

  lancamentos: ContaPagarDto[] = [];

  selected = new Set<number>();

  sortKey: SortKey = 'dueDate';

  sortDir: 1 | -1 = -1;

  constructor(private excel: ExportExcelService, private service: ApiService, private toast: ToastrService) {
  }

  activeTab: 'dados' | 'recorrencia' | 'adicionais' | 'documentos' = 'dados';

  get total(): number {
    return this.lancamentos.reduce((sum, r) => sum + r.amount, 0);
  }

  setTab(t: typeof this.activeTab) { this.activeTab = t; }

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

  toggleRow(id: number, checked: boolean) {
    checked ? this.selected.add(id) : this.selected.delete(id);
  }

  sortBy(k: SortKey) {
    if (this.sortKey === k) this.sortDir = this.sortDir === 1 ? -1 : 1;
    else { this.sortKey = k; this.sortDir = 1; }
  }

  filtrar() {
    this.service.getPayablePeriodo(this.dtIni, this.dtFim, this.typeFilter, this.categoriaFilter).subscribe((data) => {
      this.lancamentos = data
    })
  }
  exportar() { console.log('Exportar', this.lancamentos); }
  adicionar() { console.log('Abrir modal de cadastro'); }
  excluir(row: ContaPagarDto) { console.log('Excluir', row); }


  addeContasPagar() {

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

  lancamentoSelecionado: any = {
  id: 0,
  dueDate: new Date().toISOString().substring(0,10),
  amount: 0,
  accountId: null,
  categoryId: null,
  costCenterId: null,
  description: '',
  notes: ''
};

  marcarPagoForm = {
    dataPagamento: (new Date()).toISOString().substring(0, 10),
    accountId: null as number | null,
    amount: 0
  };

  // abre modal Editar (já existe o método editar(r) no seu HTML)
  editar(r: any) {
    // clone para evitar mutar a lista antes de salvar
    this.lancamentoSelecionado = { ...r };
  }

  // salvar edição -> chama service
  confirmarEditar() {
    const payload = {
      id: this.lancamentoSelecionado.id,
      dueDate: this.lancamentoSelecionado.dueDate,
      amount: this.lancamentoSelecionado.amount,
      description: this.lancamentoSelecionado.description,
      categoryId: this.lancamentoSelecionado.categoryId,
      accountId: this.lancamentoSelecionado.accountId,
      costCenterId: this.lancamentoSelecionado.costCenterId,
      notes: this.lancamentoSelecionado.notes
    };

    this.service.updatePayable(payload.id, payload).subscribe({
      next: () => {
        // sincroniza a lista na UI
        const idx = this.lancamentos.findIndex((x: any) => x.id === payload.id);
        if (idx >= 0) this.lancamentos[idx] = { ...this.lancamentoSelecionado };
        this.toast.success('Lançamento atualizado com sucesso!');
      },
      error: (e) => this.toast.error('Erro ao atualizar: ' + (e?.message || e))
    });
  }

  // preparar modal de pagamento (seu HTML chama marcarRecebido(r))
  marcarRecebido(r: any) {
    this.lancamentoSelecionado = { ...r };
    this.marcarPagoForm = {
      dataPagamento: (new Date()).toISOString().substring(0, 10),
      accountId: r.accountId || null,
      amount: r.amount
    };
  }

  // confirmar pagamento -> chama service
  confirmarMarcarPago() {
    const body = {
      id: this.lancamentoSelecionado.id,
      paidDate: this.marcarPagoForm.dataPagamento,
      accountId: this.marcarPagoForm.accountId,
      amount: Number(this.marcarPagoForm.amount || 0)
    };

    this.service.markAsPaid(body.id, body).subscribe({
      next: () => {
        // atualiza item na lista
        const idx = this.lancamentos.findIndex((x: any) => x.id === body.id);
        if (idx >= 0) {
          this.lancamentos[idx] = {
            ...this.lancamentos[idx],
            paid: true,
            paidDate: body.paidDate,
            amount: body.amount
          };
        }
        this.toast.success('Pagamento confirmado!');
      },
      error: (e) => this.toast.error('Erro ao marcar como pago: ' + (e?.message || e))
    });
  }
}
