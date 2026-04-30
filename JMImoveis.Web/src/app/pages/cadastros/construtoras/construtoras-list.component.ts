import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConstrutoraService } from '../../../services/construtora.service';
import { Construtora } from '../../../models/construtora.model';

@Component({
    selector: 'app-construtoras-list',
    templateUrl: './construtoras-list.component.html',
    styleUrls: ['./construtoras-list.component.scss']
})
export class ConstrutorasListComponent implements OnInit {
    construtoras: Construtora[] = [];
    carregando = false;

    constructor(
        private construtoraService: ConstrutoraService,
        private router: Router,
        private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.carregarConstrutoras();
    }

    carregarConstrutoras(): void {
        this.carregando = true;
        this.construtoraService.getAll().subscribe({
            next: (data) => {
                this.construtoras = data;
                this.carregando = false;
            },
            error: () => {
                this.toastr.error('Erro ao carregar construtoras');
                this.carregando = false;
            }
        });
    }

    novaConstrutora(): void {
        this.router.navigate(['/jm/cadastros/construtoras/novo']);
    }

    editarConstrutora(id: number): void {
        this.router.navigate([`/jm/cadastros/construtoras/editar/${id}`]);
    }

    async excluirConstrutora(id: number, nome: string): Promise<void> {
        if (confirm(`Tem certeza que deseja excluir a construtora "${nome}"?`)) {
            this.construtoraService.delete(id).subscribe({
                next: () => {
                    this.toastr.success('Construtora excluída com sucesso!');
                    this.carregarConstrutoras();
                },
                error: () => {
                    this.toastr.error('Erro ao excluir construtora');
                }
            });
        }
    }
}
