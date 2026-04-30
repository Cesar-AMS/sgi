import { Component, OnInit } from '@angular/core';
import { AccountsPayableService } from 'src/app/core/services/accounts-payable.service';
import { AccountsReceivableService } from 'src/app/core/services/accounts-receivable.service';

interface ExtratoItem {
  data: string;
  descricao: string;
  categoria: string;
  entrada: number;
  saida: number;
  saldo: number;
}

interface MovimentoCaixa {
  id: number;
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
}

@Component({
  selector: 'app-financeiro-fluxo-caixa',
  templateUrl: './fluxo-caixa.component.html',
  styleUrls: ['./fluxo-caixa.component.scss'],
})
export class FinanceiroFluxoCaixaComponent implements OnInit {
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

  totalEntradas = 0;
  totalSaidas = 0;
  saldoPeriodo = 0;

  entradas: MovimentoCaixa[] = [];
  saidas: MovimentoCaixa[] = [];
  extrato: ExtratoItem[] = [];

  carregandoEntradas = false;
  carregandoSaidas = false;
  mensagemErro = '';

  constructor(
    private contasReceberService: AccountsReceivableService,
    private contasPagarService: AccountsPayableService
  ) {}

  ngOnInit(): void {
    this.carregarFluxoCaixa();
  }

  carregarFluxoCaixa(): void {
    this.mensagemErro = '';
    this.entradas = [];
    this.saidas = [];
    this.extrato = [];
    this.carregarEntradas();
    this.carregarSaidas();
  }

  carregarEntradas(): void {
    const periodo = this.getPeriodoSelecionado();
    this.carregandoEntradas = true;

    this.contasReceberService.getPaged({
      dueFrom: periodo.inicio,
      dueTo: periodo.fim,
      status: 'PAID',
    }, 1, 500).subscribe({
      next: (response) => {
        const rows = ((response && response.items) || []) as any[];
        this.entradas = rows
          .filter((item) => String(item.status || '').toUpperCase() === 'PAID')
          .map((item) => ({
            id: item.id,
            data: item.paidDate || item.dueDate || item.createdAt,
            descricao: item.description || `Recebimento #${item.id}`,
            categoria: item.category || 'Recebimento',
            valor: this.toNumber(item.amount),
          }));

        this.totalEntradas = this.somar(this.entradas);
        this.calcularSaldo();
        this.montarExtrato();
        this.carregandoEntradas = false;
      },
      error: () => {
        this.entradas = [];
        this.totalEntradas = 0;
        this.calcularSaldo();
        this.montarExtrato();
        this.carregandoEntradas = false;
        this.mensagemErro = 'Nao foi possivel carregar as entradas do periodo.';
      },
    });
  }

  carregarSaidas(): void {
    const periodo = this.getPeriodoSelecionado();
    this.carregandoSaidas = true;

    this.contasPagarService.getPaged({
      dueFrom: periodo.inicio,
      dueTo: periodo.fim,
      status: 'PAID',
      page: 1,
      pageSize: 500,
    }).subscribe({
      next: (response) => {
        const rows = ((response && response.items) || []) as any[];
        this.saidas = rows
          .filter((item) => String(item.status || '').toUpperCase() === 'PAID')
          .map((item) => ({
            id: item.id,
            data: item.paidDate || item.dueDate || item.createdAt,
            descricao: item.description || `Pagamento #${item.id}`,
            categoria: item.category || 'Pagamento',
            valor: this.toNumber(item.amount),
          }));

        this.totalSaidas = this.somar(this.saidas);
        this.calcularSaldo();
        this.montarExtrato();
        this.carregandoSaidas = false;
      },
      error: () => {
        this.saidas = [];
        this.totalSaidas = 0;
        this.calcularSaldo();
        this.montarExtrato();
        this.carregandoSaidas = false;
        this.mensagemErro = 'Nao foi possivel carregar as saidas do periodo.';
      },
    });
  }

  calcularSaldo(): void {
    this.saldoPeriodo = this.totalEntradas - this.totalSaidas;
  }

  montarExtrato(): void {
    const items: ExtratoItem[] = [
      ...this.entradas.map((entrada) => ({
        data: entrada.data,
        descricao: entrada.descricao,
        categoria: entrada.categoria,
        entrada: entrada.valor,
        saida: 0,
        saldo: 0,
      })),
      ...this.saidas.map((saida) => ({
        data: saida.data,
        descricao: saida.descricao,
        categoria: saida.categoria,
        entrada: 0,
        saida: saida.valor,
        saldo: 0,
      })),
    ];

    items.sort((a, b) => new Date(a.data || 0).getTime() - new Date(b.data || 0).getTime());

    let saldoAcumulado = 0;
    this.extrato = items.map((item) => {
      saldoAcumulado += item.entrada - item.saida;
      return { ...item, saldo: saldoAcumulado };
    });
  }

  onChangePeriodo(): void {
    this.carregarFluxoCaixa();
  }

  get carregando(): boolean {
    return this.carregandoEntradas || this.carregandoSaidas;
  }

  get entradasPercentual(): number {
    return this.getPercentualBarra(this.totalEntradas);
  }

  get saidasPercentual(): number {
    return this.getPercentualBarra(this.totalSaidas);
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

  private somar(items: MovimentoCaixa[]): number {
    return items.reduce((sum, item) => sum + this.toNumber(item.valor), 0);
  }

  private toNumber(value: any): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private getPercentualBarra(value: number): number {
    const maiorValor = Math.max(this.totalEntradas, this.totalSaidas);
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
