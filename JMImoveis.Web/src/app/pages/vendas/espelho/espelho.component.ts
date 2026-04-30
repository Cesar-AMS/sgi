import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConstrutoraService } from '../../../services/construtora.service';
import { EmpreendimentoService } from '../../../services/empreendimento.service';
import { UnidadeService } from '../../../services/unidade.service';
import { Construtora } from '../../../models/construtora.model';
import { Empreendimento } from '../../../models/empreendimento.model';
import { Unidade, StatusConfig } from '../../../models/unidade.model';
import { FichaPropostaInicial } from '../../project/propostas/propostas.component';

@Component({
    selector: 'app-vendas-espelho',
    templateUrl: './espelho.component.html',
    styleUrls: ['./espelho.component.scss']
})
export class EspelhoVendasComponent implements OnInit {
    private readonly filtrosStorageKey = 'filtrosVendas';
    construtoras: Construtora[] = [];
    construtoraSelecionada: Construtora | null = null;
    empreendimentos: Empreendimento[] = [];
    empreendimentoSelecionado: Empreendimento | null = null;
    unidades: Unidade[] = [];
    carregandoConstrutoras = false;
    carregandoUnidades = false;
    statusConfig = StatusConfig;
    fichaProposta: FichaPropostaInicial | null = null;
    unidadesPorAndar: Array<{ andar: number; label: string; unidades: Unidade[] }> = [];

    constructor(
        private construtoraService: ConstrutoraService,
        private empreendimentoService: EmpreendimentoService,
        private unidadeService: UnidadeService,
        private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.carregarConstrutoras();
    }

    carregarConstrutoras(): void {
        this.carregandoConstrutoras = true;
        this.construtoraService.getAll().subscribe({
            next: (data) => {
                this.construtoras = data;
                this.restaurarFiltrosSalvos();
                this.carregandoConstrutoras = false;
            },
            error: () => {
                this.toastr.error('Erro ao carregar construtoras');
                this.carregandoConstrutoras = false;
            }
        });
    }

    onConstrutoraChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const id = Number(select.value);
        this.construtoraSelecionada = this.construtoras.find((c) => c.id === id) || null;
        this.empreendimentoSelecionado = null;
        this.unidades = [];
        this.unidadesPorAndar = [];
        this.empreendimentos = [];

        if (this.construtoraSelecionada) {
            this.carregarEmpreendimentos();
            this.carregarUnidadesPorConstrutora();
        }
    }

    carregarEmpreendimentos(empreendimentoIdParaRestaurar?: number): void {
        if (!this.construtoraSelecionada) {
            return;
        }

        this.empreendimentoService.getByConstrutoraId(this.construtoraSelecionada.id).subscribe({
            next: (data) => {
                console.log('Empreendimentos recebidos:', data);
                console.log('Primeiro item:', data[0]);
                this.empreendimentos = data;

                if (empreendimentoIdParaRestaurar) {
                    this.empreendimentoSelecionado = this.empreendimentos.find((e) => e.id === empreendimentoIdParaRestaurar) || null;

                    if (this.empreendimentoSelecionado) {
                        this.carregarUnidadesPorEmpreendimento();
                        return;
                    }

                    this.carregarUnidadesPorConstrutora();
                }
            },
            error: () => {
                this.toastr.error('Erro ao carregar empreendimentos');
            }
        });
    }

    carregarUnidadesPorConstrutora(): void {
        if (!this.construtoraSelecionada) {
            return;
        }

        this.carregandoUnidades = true;
        this.unidadeService.getByConstrutoraId(this.construtoraSelecionada.id).subscribe({
            next: (data) => {
                this.unidades = this.ordenarUnidades(data);
                this.unidadesPorAndar = this.agruparUnidadesPorAndar(this.unidades);
                this.carregandoUnidades = false;
            },
            error: () => {
                this.toastr.error('Erro ao carregar unidades');
                this.carregandoUnidades = false;
            }
        });
    }

    carregarUnidadesPorEmpreendimento(): void {
        if (!this.empreendimentoSelecionado) {
            return;
        }

        this.carregandoUnidades = true;
        this.unidadeService.getByEmpreendimentoId(this.empreendimentoSelecionado.id).subscribe({
            next: (data) => {
                this.unidades = this.ordenarUnidades(data);
                this.unidadesPorAndar = this.agruparUnidadesPorAndar(this.unidades);
                this.carregandoUnidades = false;
            },
            error: () => {
                this.toastr.error('Erro ao carregar unidades');
                this.carregandoUnidades = false;
            }
        });
    }

    onEmpreendimentoChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const id = Number(select.value);
        this.empreendimentoSelecionado = this.empreendimentos.find((e) => e.id === id) || null;

        if (this.empreendimentoSelecionado) {
            this.carregarUnidadesPorEmpreendimento();
            return;
        }

        this.carregarUnidadesPorConstrutora();
    }

    abrirProposta(unidade: Unidade): void {
        const estadoFiltros = {
            construtoraId: this.construtoraSelecionada?.id,
            empreendimentoId: this.empreendimentoSelecionado?.id,
            timestamp: Date.now()
        };
        sessionStorage.setItem(this.filtrosStorageKey, JSON.stringify(estadoFiltros));

        this.fichaProposta = {
            unidadeId: unidade.id,
            unidadeNumero: unidade.numero,
            empreendimentoId: unidade.empreendimentoId,
            valor: unidade.valor
        };
    }

    fecharFichaProposta(): void {
        this.fichaProposta = null;

        if (this.empreendimentoSelecionado) {
            this.carregarUnidadesPorEmpreendimento();
            return;
        }

        if (this.construtoraSelecionada) {
            this.carregarUnidadesPorConstrutora();
        }
    }

    private restaurarFiltrosSalvos(): void {
        const filtros = this.obterFiltrosSalvos();
        if (!filtros?.construtoraId) {
            return;
        }

        this.construtoraSelecionada = this.construtoras.find((c) => c.id === filtros.construtoraId) || null;
        this.empreendimentoSelecionado = null;
        this.empreendimentos = [];
        this.unidades = [];
        this.unidadesPorAndar = [];

        if (!this.construtoraSelecionada) {
            return;
        }

        this.carregarEmpreendimentos(filtros.empreendimentoId);

        if (!filtros.empreendimentoId) {
            this.carregarUnidadesPorConstrutora();
        }
    }

    private obterFiltrosSalvos(): { construtoraId?: number; empreendimentoId?: number; timestamp?: number } | null {
        const raw = sessionStorage.getItem(this.filtrosStorageKey);
        if (!raw) {
            return null;
        }

        try {
            const filtros = JSON.parse(raw) as { construtoraId?: number; empreendimentoId?: number; timestamp?: number };
            const expirado = !filtros.timestamp || Date.now() - filtros.timestamp > 30 * 60 * 1000;

            if (expirado) {
                sessionStorage.removeItem(this.filtrosStorageKey);
                return null;
            }

            return filtros;
        } catch {
            sessionStorage.removeItem(this.filtrosStorageKey);
            return null;
        }
    }

    private ordenarUnidades(unidades: Unidade[]): Unidade[] {
        return [...unidades].sort((a, b) => {
            const andarA = Number(a.andar ?? 0);
            const andarB = Number(b.andar ?? 0);

            if (andarA !== andarB) {
                return andarB - andarA;
            }

            const numeroA = this.extrairNumeroUnidade(a.numero);
            const numeroB = this.extrairNumeroUnidade(b.numero);

            if (numeroA !== numeroB) {
                return numeroA - numeroB;
            }

            return String(a.numero).localeCompare(String(b.numero), 'pt-BR', { numeric: true });
        });
    }

    private extrairNumeroUnidade(numero: string): number {
        const match = String(numero || '').match(/\d+/);
        return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
    }

    private agruparUnidadesPorAndar(unidades: Unidade[]): Array<{ andar: number; label: string; unidades: Unidade[] }> {
        const grupos = new Map<number, Unidade[]>();

        unidades.forEach((unidade) => {
            const andar = Number(unidade.andar ?? 0);
            const lista = grupos.get(andar) ?? [];
            lista.push(unidade);
            grupos.set(andar, lista);
        });

        return Array.from(grupos.entries())
            .sort(([andarA], [andarB]) => andarB - andarA)
            .map(([andar, lista]) => ({
                andar,
                label: this.labelAndar(andar),
                unidades: this.ordenarUnidades(lista)
            }));
    }

    private labelAndar(andar: number): string {
        if (andar < 0) {
            const nivel = Math.abs(andar);
            return nivel === 1 ? 'Subsolo' : `Subsolo ${nivel}`;
        }

        if (andar > 0) {
            return `${andar}${String.fromCharCode(186)}`;
        }

        if (andar === 0) {
            return 'Térreo';
            return 'Térreo';
        }

        return `${andar}º`;
    }

}
