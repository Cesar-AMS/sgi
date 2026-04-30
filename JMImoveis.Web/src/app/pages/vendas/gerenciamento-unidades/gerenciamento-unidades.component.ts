import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Construtora } from '../../../models/construtora.model';
import { Empreendimento } from '../../../models/empreendimento.model';
import { StatusConfig, StatusUnidade, Unidade } from '../../../models/unidade.model';
import { UpdateStatus } from '../../../models/update-status.model';
import { ConstrutoraService } from '../../../services/construtora.service';
import { EmpreendimentoService } from '../../../services/empreendimento.service';
import { UnidadeService } from '../../../services/unidade.service';

interface UnidadeForm {
    id: number | null;
    numero: string;
    andar: number | null;
    area: number | string | null;
    dormitorios: number | null;
    valor: number | null;
    perfilRenda: string;
    status: StatusUnidade;
    empreendimentoId: number | null;
}

@Component({
    selector: 'app-gerenciamento-unidades',
    templateUrl: './gerenciamento-unidades.component.html',
    styleUrls: ['./gerenciamento-unidades.component.scss']
})
export class GerenciamentoUnidadesComponent implements OnInit {
    construtoras: Construtora[] = [];
    empreendimentos: Empreendimento[] = [];
    unidades: Unidade[] = [];

    construtoraFiltro = 0;
    empreendimentoFiltro = 0;
    statusFiltro = '';

    carregando = false;
    salvando = false;
    mostrarFormulario = false;

    statusOptions: Array<{ value: StatusUnidade; label: string }> = [
        { value: 'disponivel', label: 'Disponivel' },
        { value: 'reservada', label: 'Reservada' },
        { value: 'vendida', label: 'Vendida' }
    ];
    perfilRendaOptions = [
        { value: '', label: 'Nao informado' },
        { value: 'HIS1', label: 'HIS 1' },
        { value: 'HIS2', label: 'HIS 2' }
    ];

    form: UnidadeForm = this.criarFormVazio();
    statusConfig = StatusConfig;

    constructor(
        private construtoraService: ConstrutoraService,
        private empreendimentoService: EmpreendimentoService,
        private unidadeService: UnidadeService,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.carregarConstrutoras();
        this.carregarEmpreendimentos();
        this.carregarUnidades();
    }

    carregarConstrutoras(): void {
        this.construtoraService.getAll().subscribe({
            next: (data) => this.construtoras = data,
            error: () => this.toastr.error('Erro ao carregar construtoras')
        });
    }

    carregarEmpreendimentos(): void {
        const request$ = this.construtoraFiltro > 0
            ? this.empreendimentoService.getByConstrutoraId(this.construtoraFiltro)
            : this.empreendimentoService.getAll();

        request$.subscribe({
            next: (data) => {
                this.empreendimentos = data;
                if (this.empreendimentoFiltro && !this.empreendimentos.some(e => e.id === this.empreendimentoFiltro)) {
                    this.empreendimentoFiltro = 0;
                }
            },
            error: () => this.toastr.error('Erro ao carregar empreendimentos')
        });
    }

    carregarUnidades(): void {
        this.carregando = true;

        const request$ = this.empreendimentoFiltro > 0
            ? this.unidadeService.getByEmpreendimentoId(this.empreendimentoFiltro)
            : this.unidadeService.getAll();

        request$.subscribe({
            next: (data) => {
                this.unidades = this.aplicarFiltrosLocais(data);
                this.carregando = false;
            },
            error: () => {
                this.toastr.error('Erro ao carregar unidades');
                this.carregando = false;
            }
        });
    }

    onConstrutoraChange(): void {
        this.empreendimentoFiltro = 0;
        this.carregarEmpreendimentos();
        this.carregarUnidades();
    }

    filtrar(): void {
        this.carregarUnidades();
    }

    novaUnidade(): void {
        this.form = this.criarFormVazio();
        this.mostrarFormulario = true;
    }

    editarUnidade(unidade: Unidade): void {
        this.form = {
            id: unidade.id,
            numero: unidade.numero,
            andar: unidade.andar ?? 0,
            area: unidade.area ?? null,
            dormitorios: unidade.dormitorios ?? null,
            valor: unidade.valor ?? null,
            perfilRenda: unidade.perfilRenda ?? '',
            status: unidade.status as StatusUnidade,
            empreendimentoId: unidade.empreendimentoId
        };
        this.mostrarFormulario = true;
    }

    cancelar(): void {
        this.mostrarFormulario = false;
        this.form = this.criarFormVazio();
    }

    salvar(): void {
        if (!this.form.numero || !this.form.empreendimentoId) {
            this.toastr.warning('Informe numero e empreendimento');
            return;
        }

        this.salvando = true;

        const payloadBase: any = {
            id: this.form.id,
            number: this.form.numero,
            block: 'A',
            floor: this.form.andar ?? 0,
            size: String(this.form.area ?? ''),
            dormitories: this.form.dormitorios ?? 0,
            value: this.form.valor,
            income: this.form.perfilRenda,
            status: this.mapearStatus(this.form.status)
        };

        // Só incluir enterpriseId se for criação (não tem id)
        const payload = this.form.id
            ? payloadBase
            : { ...payloadBase, enterpriseId: this.form.empreendimentoId };

        console.log('Enviando unidade:', payload);

        const request$: Observable<unknown> = this.form.id
            ? this.unidadeService.update(this.form.id, payload)
            : this.unidadeService.create(payload);

        request$.subscribe({
            next: () => {
                this.toastr.success(this.form.id ? 'Unidade atualizada com sucesso' : 'Unidade cadastrada com sucesso');
                this.cancelar();
                this.carregarUnidades();
            },
            error: () => this.toastr.error('Erro ao salvar unidade'),
            complete: () => this.salvando = false
        });
    }
    private mapearStatus(status: string): string {
        const mapa: Record<string, string> = {
            disponivel: 'OPEN',
            reservada: 'RESERVED',
            vendida: 'SELL'
        };

        return mapa[status] || 'OPEN';
    }

    excluirUnidade(unidade: Unidade): void {
        if (!confirm(`Excluir a unidade "${unidade.numero}"?`)) {
            return;
        }

        this.unidadeService.delete(unidade.id).subscribe({
            next: () => {
                this.toastr.success('Unidade excluida com sucesso');
                this.carregarUnidades();
            },
            error: () => this.toastr.error('Erro ao excluir unidade')
        });
    }

    mudarStatus(unidade: Unidade, novoStatus: StatusUnidade): void {
        if (unidade.status === novoStatus) {
            return;
        }

        const updateData: UpdateStatus = { status: novoStatus };

        this.unidadeService.updateStatus(unidade.id, updateData).subscribe({
            next: () => {
                unidade.status = novoStatus;
                unidade.statusTexto = this.statusConfig[novoStatus].texto;
                unidade.statusCor = this.statusConfig[novoStatus].cssClass;
                this.toastr.success(`Unidade ${unidade.numero} ${this.statusConfig[novoStatus].texto.toLowerCase()}`);
            },
            error: () => this.toastr.error('Erro ao atualizar status')
        });
    }

    nomeEmpreendimento(id: number): string {
        return this.empreendimentos.find(e => e.id === id)?.nome || '-';
    }

    private aplicarFiltrosLocais(unidades: Unidade[]): Unidade[] {
        const empreendimentosPermitidos = new Set(this.empreendimentos.map(e => e.id));

        return unidades.filter(unidade => {
            const porStatus = !this.statusFiltro || unidade.status === this.statusFiltro;
            const porEmpreendimento = !this.empreendimentoFiltro || unidade.empreendimentoId === this.empreendimentoFiltro;
            const porConstrutora = !this.construtoraFiltro || empreendimentosPermitidos.has(unidade.empreendimentoId);
            return porStatus && porEmpreendimento && porConstrutora;
        });
    }

    private criarFormVazio(): UnidadeForm {
        return {
            id: null,
            numero: '',
            andar: 0,
            area: null,
            dormitorios: null,
            valor: null,
            perfilRenda: '',
            status: 'disponivel',
            empreendimentoId: null
        };
    }
}
