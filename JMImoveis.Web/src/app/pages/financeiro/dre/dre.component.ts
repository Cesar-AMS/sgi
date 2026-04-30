import { Component, OnInit } from '@angular/core';
import { AccountsPayableService } from 'src/app/core/services/accounts-payable.service';
import { SalesService } from 'src/app/core/services/sales.service';
import { Sales } from 'src/app/models/ContaBancaria';

interface DreLinha {
  id: number;
  descricao: string;
  detalhe?: string;
  valor: number;
  data?: string | null;
  categoria?: string | null;
  status?: string | null;
}

@Component({
  selector: 'app-financeiro-dre',
  templateUrl: './dre.component.html',
  styleUrls: ['./dre.component.scss'],
})
export class FinanceiroDreComponent implements OnInit {
  anoSelecionado = new Date().getFullYear();
  mesSelecionado = new Date().getMonth() + 1;

  anos = [2024, 2025, 2026, 2027, 2028];
  meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Marco' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  receitas: DreLinha[] = [];
  despesas: DreLinha[] = [];

  totalReceitas = 0;
  totalDespesas = 0;
  totalComissoes = 0;
  totalOutrasDespesas = 0;
  resultadoLiquido = 0;

  carregandoReceitas = false;
  carregandoDespesas = false;
  mensagemErro = '';

  private readonly saleStatuses = ['APROVADO', 'APPROVED', 'SELL', 'SOLD', 'VENDIDO'];

  constructor(
    private salesService: SalesService,
    private accountsPayableService: AccountsPayableService
  ) {}

  ngOnInit(): void {
    this.carregarDRE();
  }

  carregarDRE(): void {
    this.mensagemErro = '';
    this.carregarReceitas();
    this.carregarDespesas();
  }

  carregarReceitas(): void {
    const periodo = this.getPeriodoSelecionado();
    this.carregandoReceitas = true;

    this.salesService.getOpportunityList({
      startAt: periodo.inicio,
      finishAt: periodo.fim,
      enterpriseId: 0,
      filialId: 0,
      clienteId: 0,
      status: '',
      managementId: 0,
    }).subscribe({
      next: (vendas) => {
        const vendasAprovadas = (vendas || []).filter((venda) => this.isVendaAprovada(venda));

        this.receitas = vendasAprovadas.map((venda) => ({
          id: venda.id,
          descricao: venda.cliente || `Venda #${venda.id}`,
          detalhe: this.getVendaDetalhe(venda),
          valor: this.toNumber(venda.unitValue),
          data: venda.selledAt || venda.updatedAt || venda.createdAt,
          status: venda.status,
        }));

        this.totalReceitas = this.somar(this.receitas);
        this.calcularResultado();
        this.carregandoReceitas = false;
      },
      error: () => {
        this.receitas = [];
        this.totalReceitas = 0;
        this.calcularResultado();
        this.carregandoReceitas = false;
        this.mensagemErro = 'Nao foi possivel carregar as receitas do periodo.';
      },
    });
  }

  carregarDespesas(): void {
    const periodo = this.getPeriodoSelecionado();
    this.carregandoDespesas = true;

    this.accountsPayableService.getPaged({
      dueFrom: periodo.inicio,
      dueTo: periodo.fim,
      page: 1,
      pageSize: 500,
    }).subscribe({
      next: (response) => {
        const contas = ((response && response.items) || []) as any[];
        const contasValidas = contas.filter((conta) => String(conta.status || '').toUpperCase() !== 'CANCELLED');

        this.despesas = contasValidas.map((conta) => ({
          id: conta.id,
          descricao: conta.description || `Conta a pagar #${conta.id}`,
          detalhe: this.getDespesaDetalhe(conta),
          valor: this.toNumber(conta.amount || conta.pendingAmount),
          data: conta.dueDate,
          categoria: conta.category,
          status: conta.status,
        }));

        this.totalDespesas = this.somar(this.despesas);
        this.totalComissoes = this.somar(this.despesas.filter((despesa) => this.isComissao(despesa)));
        this.totalOutrasDespesas = this.totalDespesas - this.totalComissoes;
        this.calcularResultado();
        this.carregandoDespesas = false;
      },
      error: () => {
        this.despesas = [];
        this.totalDespesas = 0;
        this.totalComissoes = 0;
        this.totalOutrasDespesas = 0;
        this.calcularResultado();
        this.carregandoDespesas = false;
        this.mensagemErro = 'Nao foi possivel carregar as despesas do periodo.';
      },
    });
  }

  calcularResultado(): void {
    this.resultadoLiquido = this.totalReceitas - this.totalDespesas;
  }

  onChangePeriodo(): void {
    this.carregarDRE();
  }

  get carregando(): boolean {
    return this.carregandoReceitas || this.carregandoDespesas;
  }

  get receitasPercentual(): number {
    return this.getPercentualBarra(this.totalReceitas);
  }

  get despesasPercentual(): number {
    return this.getPercentualBarra(this.totalDespesas);
  }

  isComissao(item: DreLinha): boolean {
    return String(item.categoria || '').toUpperCase().startsWith('COMISSAO');
  }

  private getPeriodoSelecionado(): { inicio: string; fim: string } {
    const mes = Number(this.mesSelecionado);
    const ano = Number(this.anoSelecionado);
    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 0);

    return {
      inicio: this.formatDate(inicio),
      fim: this.formatDate(fim),
    };
  }

  private isVendaAprovada(venda: Sales): boolean {
    return this.saleStatuses.includes(String(venda.status || '').toUpperCase());
  }

  private getVendaDetalhe(venda: Sales): string {
    const partes = [venda.enterpriseName, venda.unitName].filter(Boolean);
    return partes.length ? partes.join(' - ') : 'Venda realizada no periodo';
  }

  private getDespesaDetalhe(conta: any): string {
    const categoria = conta.category ? String(conta.category).replace(/_/g, ' ') : 'Conta a pagar';
    const status = conta.status ? String(conta.status).replace(/_/g, ' ') : '';
    return [categoria, status].filter(Boolean).join(' - ');
  }

  private somar(items: DreLinha[]): number {
    return items.reduce((sum, item) => sum + this.toNumber(item.valor), 0);
  }

  private toNumber(value: any): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private getPercentualBarra(value: number): number {
    const maiorValor = Math.max(this.totalReceitas, this.totalDespesas);
    if (!maiorValor) {
      return 0;
    }

    return Math.max(4, Math.round((value / maiorValor) * 100));
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
