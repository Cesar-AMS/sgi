import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EmpreendimentoService } from '../../../services/empreendimento.service';
import { ConstrutoraService } from '../../../services/construtora.service';
import { Empreendimento } from '../../../models/empreendimento.model';
import { Construtora } from '../../../models/construtora.model';

@Component({
    selector: 'app-empreendimentos-list',
    templateUrl: './empreendimentos-list.component.html',
    styleUrls: ['./empreendimentos-list.component.scss']
})
export class EmpreendimentosListComponent implements OnInit {
    empreendimentos: Empreendimento[] = [];
    construtoras: Construtora[] = [];
    construtoraFiltro = 0;
    carregando = false;

    constructor(
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
        this.carregando = true;

        if (this.construtoraFiltro > 0) {
            this.empreendimentoService.getByConstrutoraId(this.construtoraFiltro).subscribe({
                next: (data) => {
                    this.empreendimentos = data;
                    this.carregando = false;
                },
                error: () => {
                    this.toastr.error('Erro ao carregar empreendimentos');
                    this.carregando = false;
                }
            });
        } else {
            this.empreendimentoService.getAll().subscribe({
                next: (data) => {
                    this.empreendimentos = data;
                    this.carregando = false;
                },
                error: () => {
                    this.toastr.error('Erro ao carregar empreendimentos');
                    this.carregando = false;
                }
            });
        }
    }

    filtrar(): void {
        this.carregarEmpreendimentos();
    }

    novoEmpreendimento(): void {
        this.router.navigate(['/jm/cadastros/empreendimentos/novo']);
    }

    editarEmpreendimento(id: number): void {
        this.router.navigate([`/jm/cadastros/empreendimentos/editar/${id}`]);
    }

    async excluirEmpreendimento(id: number, nome: string): Promise<void> {
        if (confirm(`Tem certeza que deseja excluir o empreendimento "${nome}"?`)) {
            this.empreendimentoService.delete(id).subscribe({
                next: () => {
                    this.toastr.success('Empreendimento excluído com sucesso!');
                    this.carregarEmpreendimentos();
                },
                error: () => {
                    this.toastr.error('Erro ao excluir empreendimento');
                }
            });
        }
    }

    obterNomeConstrutora(id: number): string {
        const construtora = this.construtoras.find(c => c.id === id);
        return construtora ? construtora.nome : '-';
    }
}
