import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AccountsPayableService } from 'src/app/core/services/accounts-payable.service';
import { AdminAccessService } from 'src/app/core/services/admin-access.service';
import { ApiService } from 'src/app/core/services/api.service';
import { Usuarios } from 'src/app/models/ContaBancaria';

type CommissionStatus = 'PROJECAO' | 'WAITING' | 'PENDENTE' | 'PAID' | 'PAGO' | 'CANCELLED';

interface ComissaoItem {
  id: number;
  vendedorId?: number | null;
  vendedorNome: string;
  valor: number;
  valorPendente: number;
  status: CommissionStatus;
  dataPrevista?: string | null;
  vendaId?: number | null;
  categoria?: string | null;
}

interface PercentualItem {
  id: number;
  vendedorNome: string;
  percentual: number;
  tipoUnidade: string;
  usuario: Usuarios;
}

@Component({
  selector: 'app-comissoes',
  templateUrl: './comissoes.component.html',
  styleUrls: ['./comissoes.component.scss'],
})
export class ComissoesComponent implements OnInit {
  activeTab: 'lista' | 'config' = 'lista';

  loading = false;
  savingPercentual = false;
  payingId: number | null = null;
  errorMessage = '';

  vendedores: Usuarios[] = [];
  comissoes: ComissaoItem[] = [];
  percentuais: PercentualItem[] = [];

  filtro = {
    vendedorId: '',
    periodo: this.currentMonth(),
    status: '',
  };

  percentualForm = {
    id: null as number | null,
    vendedorId: '',
    percentual: 0,
    tipoUnidade: 'PADRAO',
  };

  showPercentualForm = false;

  constructor(
    private accountsPayableService: AccountsPayableService,
    private apiService: ApiService,
    private adminAccessService: AdminAccessService
  ) {}

  ngOnInit(): void {
    this.carregarVendedores();
    this.buscar();
  }

  buscar(): void {
    this.loading = true;
    this.errorMessage = '';

    const params: any = {
      category: 'COMISSAO',
      page: 1,
      pageSize: 500,
    };

    if (this.filtro.vendedorId) {
      params.userId = Number(this.filtro.vendedorId);
    }

    if (this.filtro.status) {
      params.status = this.mapStatusToApi(this.filtro.status);
    }

    const range = this.monthRange(this.filtro.periodo);
    if (range) {
      params.dueFrom = range.from;
      params.dueTo = range.to;
    }

    this.accountsPayableService.getPaged(params)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          this.comissoes = (res?.items ?? []).map((item: any) => this.mapComissao(item));
        },
        error: () => {
          this.comissoes = [];
          this.errorMessage = 'Nao foi possivel carregar as comissoes.';
        },
      });
  }

  registrarPagamento(id: number): void {
    const item = this.comissoes.find(c => c.id === id);
    if (!item || this.isPago(item.status)) return;

    const valor = Number(item.valorPendente || item.valor || 0);
    if (valor <= 0) return;

    this.payingId = id;
    this.accountsPayableService.settle(id, {
      paidValue: valor,
      paidDate: this.todayInput(),
      observations: 'Pagamento de comissao registrado pelo modulo de Comissoes',
    })
      .pipe(finalize(() => (this.payingId = null)))
      .subscribe({
        next: () => this.buscar(),
        error: () => {
          this.errorMessage = 'Nao foi possivel registrar o pagamento.';
        },
      });
  }

  novoPercentual(): void {
    this.percentualForm = {
      id: null,
      vendedorId: '',
      percentual: 0,
      tipoUnidade: 'PADRAO',
    };
    this.showPercentualForm = true;
  }

  editarPercentual(id: number): void {
    const item = this.percentuais.find(p => p.id === id);
    if (!item) return;

    this.percentualForm = {
      id: item.id,
      vendedorId: String(item.id),
      percentual: item.percentual,
      tipoUnidade: item.tipoUnidade || 'PADRAO',
    };
    this.showPercentualForm = true;
  }

  cancelarPercentual(): void {
    this.showPercentualForm = false;
  }

  salvarPercentual(): void {
    const vendedorId = Number(this.percentualForm.vendedorId);
    const usuario = this.vendedores.find(v => Number(v.id) === vendedorId);
    if (!usuario) return;

    const payload: Usuarios = {
      ...usuario,
      commissioned: true,
      valueCommissioned: Number(this.percentualForm.percentual || 0),
      tpCommissioned: this.percentualForm.tipoUnidade || 'PADRAO',
    };

    this.savingPercentual = true;
    this.adminAccessService.updateUser(payload)
      .pipe(finalize(() => (this.savingPercentual = false)))
      .subscribe({
        next: () => {
          this.showPercentualForm = false;
          this.carregarVendedores();
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel salvar o percentual.';
        },
      });
  }

  get total(): number {
    return this.comissoes.reduce((sum, item) => sum + Number(item.valor || 0), 0);
  }

  get totalPago(): number {
    return this.comissoes
      .filter(item => this.isPago(item.status))
      .reduce((sum, item) => sum + Number(item.valor || 0), 0);
  }

  get totalPendente(): number {
    return this.comissoes
      .filter(item => !this.isPago(item.status) && item.status !== 'CANCELLED')
      .reduce((sum, item) => sum + Number(item.valorPendente || item.valor || 0), 0);
  }

  getStatusClass(status: CommissionStatus): string {
    switch (this.normalizeStatus(status)) {
      case 'PAID': return 'bg-success';
      case 'WAITING': return 'bg-warning text-dark';
      case 'PROJECAO': return 'bg-info text-dark';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusLabel(status: CommissionStatus): string {
    switch (this.normalizeStatus(status)) {
      case 'PAID': return 'Pago';
      case 'WAITING': return 'Pendente';
      case 'PROJECAO': return 'Projecao';
      case 'CANCELLED': return 'Cancelado';
      default: return status || '-';
    }
  }

  private carregarVendedores(): void {
    this.apiService.getCorretores().subscribe({
      next: (res) => {
        this.vendedores = res ?? [];
        this.percentuais = this.vendedores.map(v => ({
          id: Number(v.id),
          vendedorNome: v.name,
          percentual: Number(v.valueCommissioned ?? 0),
          tipoUnidade: v.tpCommissioned || 'PADRAO',
          usuario: v,
        }));

        this.comissoes = this.comissoes.map(c => ({
          ...c,
          vendedorNome: this.nomeVendedor(c.vendedorId),
        }));
      },
      error: () => {
        this.vendedores = [];
        this.percentuais = [];
      },
    });
  }

  private mapComissao(item: any): ComissaoItem {
    const vendedorId = item.userId ?? item.UserId ?? null;
    const status = (item.status ?? item.Status ?? 'WAITING') as CommissionStatus;

    return {
      id: Number(item.id ?? item.Id),
      vendedorId,
      vendedorNome: this.nomeVendedor(vendedorId),
      valor: Number(item.amount ?? item.Amount ?? 0),
      valorPendente: Number(item.pendingAmount ?? item.PendingAmount ?? item.amount ?? item.Amount ?? 0),
      status,
      dataPrevista: item.dueDate ?? item.DueDate ?? null,
      vendaId: item.saleId ?? item.SaleId ?? null,
      categoria: item.category ?? item.Category ?? null,
    };
  }

  private nomeVendedor(id?: number | null): string {
    if (!id) return '-';
    return this.vendedores.find(v => Number(v.id) === Number(id))?.name ?? `Vendedor #${id}`;
  }

  private mapStatusToApi(status: string): string {
    if (status === 'PENDENTE') return 'WAITING';
    if (status === 'PAGO') return 'PAID';
    return status;
  }

  private normalizeStatus(status?: string | null): string {
    if (status === 'PAGO') return 'PAID';
    if (status === 'PENDENTE') return 'WAITING';
    return (status ?? '').toUpperCase();
  }

  private isPago(status: CommissionStatus): boolean {
    return this.normalizeStatus(status) === 'PAID';
  }

  private currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private monthRange(month: string): { from: string; to: string } | null {
    if (!month) return null;
    const [year, monthIndex] = month.split('-').map(Number);
    if (!year || !monthIndex) return null;
    const last = new Date(year, monthIndex, 0).getDate();
    return {
      from: `${year}-${String(monthIndex).padStart(2, '0')}-01`,
      to: `${year}-${String(monthIndex).padStart(2, '0')}-${String(last).padStart(2, '0')}`,
    };
  }

  private todayInput(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}
