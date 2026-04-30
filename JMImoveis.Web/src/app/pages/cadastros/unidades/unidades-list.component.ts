import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UnidadeService } from '../../../services/unidade.service';
import { EmpreendimentoService } from '../../../services/empreendimento.service';
import { ConstrutoraService } from '../../../services/construtora.service';
import { Unidade } from '../../../models/unidade.model';
import { Empreendimento } from '../../../models/empreendimento.model';
import { Construtora } from '../../../models/construtora.model';

@Component({
    selector: 'app-unidades-list',
    templateUrl: './unidades-list.component.html',
    styleUrls: ['./unidades-list.component.scss']
})
export class UnidadesListComponent implements OnInit {
    unidades: Unidade[] = [];
    empreendimentos: Empreendimento[] = [];
    construtoras: Construtora[] = [];
    empreendimentoFiltro = 0;
    construtoraFiltro = 0;
    carregando = false;

    constructor(
        private unidadeService: UnidadeService,
        private empreendimentoService: EmpreendimentoService,
        private construtoraService: ConstrutoraService,
        private router: Router,
        private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.carregarConstrutoras();
        this.carregarEmpreendimentos();
    }

    carregarConstrutoras(): void {
        this.construtoraService.getAll().subscribe({
            next: (data) => {
                this.construtoras = data;
            },
            error: () => {
                this.toastr.error('Erro ao carregar construtoras');
            }
        });
    }

    carregarEmpreendimentos(): void {
        if (this.construtoraFiltro > 0) {
            this.empreendimentoService.getByConstrutoraId(this.construtoraFiltro).subscribe({
                next: (data) => {
                    this.empreendimentos = data;

                    if (
                        this.empreendimentoFiltro > 0
                        && !this.empreendimentos.some(e => e.id === this.empreendimentoFiltro)
                    ) {
                        this.empreendimentoFiltro = 0;
                    }

                    this.carregarUnidades();
                },
                error: () => {
                    this.toastr.error('Erro ao carregar empreendimentos');
                    this.empreendimentos = [];
                    this.carregarUnidades();
                }
            });
            return;
        }

        this.empreendimentoService.getAll().subscribe({
            next: (data) => {
                this.empreendimentos = data;
                this.carregarUnidades();
            },
            error: () => {
                this.toastr.error('Erro ao carregar empreendimentos');
                this.empreendimentos = [];
                this.carregarUnidades();
            }
        });
    }

    carregarUnidades(): void {
        this.carregando = true;

        if (this.empreendimentoFiltro > 0) {
            this.unidadeService.getByEmpreendimentoId(this.empreendimentoFiltro).subscribe({
                next: (data) => {
                    this.unidades = data;
                    this.carregando = false;
                },
                error: () => {
                    this.toastr.error('Erro ao carregar unidades');
                    this.carregando = false;
                }
            });
            return;
        }

        this.unidadeService.getAll().subscribe({
            next: (data) => {
                this.unidades = this.filtrarUnidadesPorConstrutora(data);
                this.carregando = false;
            },
            error: () => {
                this.toastr.error('Erro ao carregar unidades');
                this.carregando = false;
            }
        });
    }

    filtrar(): void {
        this.carregarUnidades();
    }

    onConstrutoraChange(): void {
        this.empreendimentoFiltro = 0;
        this.carregarEmpreendimentos();
    }

    novaUnidade(): void {
        this.router.navigate(['/jm/cadastros/unidades/novo']);
    }

    editarUnidade(id: number): void {
        this.router.navigate([`/jm/cadastros/unidades/editar/${id}`]);
    }

    async excluirUnidade(id: number, numero: string): Promise<void> {
        if (confirm(`Tem certeza que deseja excluir a unidade "${numero}"?`)) {
            this.unidadeService.delete(id).subscribe({
                next: () => {
                    this.toastr.success('Unidade excluida com sucesso!');
                    this.carregarUnidades();
                },
                error: () => {
                    this.toastr.error('Erro ao excluir unidade');
                }
            });
        }
    }

    obterNomeEmpreendimento(id: number): string {
        const empreendimento = this.empreendimentos.find(e => e.id === id);
        return empreendimento ? empreendimento.nome : '-';
    }

    obterStatusClasse(status: string): string {
        const classes: Record<string, string> = {
            disponivel: 'status-disponivel',
            reservada: 'status-reservada',
            vendida: 'status-vendida'
        };
        return classes[status] || '';
    }

    obterStatusTexto(status: string): string {
        const textos: Record<string, string> = {
            disponivel: 'Disponivel',
            reservada: 'Reservada',
            vendida: 'Vendida'
        };
        return textos[status] || status;
    }

    private filtrarUnidadesPorConstrutora(unidades: Unidade[]): Unidade[] {
        if (this.construtoraFiltro <= 0) {
            return unidades;
        }

        const empreendimentosIds = new Set(this.empreendimentos.map(e => e.id));
        return unidades.filter(unidade => empreendimentosIds.has(unidade.empreendimentoId));
    }
}
