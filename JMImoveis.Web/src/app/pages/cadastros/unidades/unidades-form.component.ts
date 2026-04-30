import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UnidadeService } from '../../../services/unidade.service';
import { EmpreendimentoService } from '../../../services/empreendimento.service';
import { ConstrutoraService } from '../../../services/construtora.service';
import { Empreendimento } from '../../../models/empreendimento.model';
import { Construtora } from '../../../models/construtora.model';

@Component({
    selector: 'app-unidades-form',
    templateUrl: './unidades-form.component.html',
    styleUrls: ['./unidades-form.component.scss']
})
export class UnidadesFormComponent implements OnInit {
    form: FormGroup;
    id: number | null = null;
    editando = false;
    carregando = false;
    empreendimentos: Empreendimento[] = [];
    construtoras: Construtora[] = [];
    construtoraFiltro = 0;

    statusOptions = [
        { value: 'disponivel', label: 'Disponivel' },
        { value: 'reservada', label: 'Reservada' },
        { value: 'vendida', label: 'Vendida' }
    ];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private unidadeService: UnidadeService,
        private empreendimentoService: EmpreendimentoService,
        private construtoraService: ConstrutoraService,
        private toastr: ToastrService
    ) {
        this.form = this.fb.group({
            numero: ['', [Validators.required]],
            block: ['A', [Validators.required]],
            area: [null],
            valor: [null],
            status: ['disponivel', [Validators.required]],
            empreendimentoId: [null, [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.carregarConstrutoras();
        this.carregarEmpreendimentos();

        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.id = parseInt(idParam, 10);
            this.editando = true;
            this.carregarUnidade();
        }
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
                    if (!this.editando) {
                        this.form.patchValue({ empreendimentoId: null });
                    }
                },
                error: () => {
                    this.toastr.error('Erro ao carregar empreendimentos');
                }
            });
            return;
        }

        this.empreendimentoService.getAll().subscribe({
            next: (data) => {
                this.empreendimentos = data;
            },
            error: () => {
                this.toastr.error('Erro ao carregar empreendimentos');
            }
        });
    }

    onConstrutoraChange(): void {
        this.form.patchValue({ empreendimentoId: null });
        this.carregarEmpreendimentos();
    }

    carregarUnidade(): void {
        if (!this.id) return;

        this.carregando = true;
        this.unidadeService.getById(this.id).subscribe({
            next: (data) => {
                this.form.patchValue({
                    numero: data.numero,
                    block: (data as any).block ?? 'A',
                    area: data.area,
                    valor: data.valor,
                    status: data.status,
                    empreendimentoId: data.empreendimentoId
                });
                this.carregando = false;
            },
            error: () => {
                this.toastr.error('Erro ao carregar unidade');
                this.carregando = false;
                this.voltar();
            }
        });
    }

    salvar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toastr.warning('Preencha todos os campos obrigatorios');
            return;
        }

        this.carregando = true;
        const dadosFront = this.form.value;
        const dadosBackend = {
            number: Number(dadosFront.numero),
            area: dadosFront.area,
            size: dadosFront.area?.toString() ?? null,
            value: Number(dadosFront.valor ?? 0),
            status: this.mapStatusParaBackend(dadosFront.status),
            block: dadosFront.block || 'A',
            floor: 0,
            dormitories: 0,
            active: true,
            enterpriseId: Number(dadosFront.empreendimentoId)
        };

        if (this.editando && this.id) {
            this.unidadeService.update(this.id, dadosBackend as any).subscribe({
                next: () => {
                    this.toastr.success('Unidade atualizada com sucesso!');
                    this.voltar();
                },
                error: () => {
                    this.toastr.error('Erro ao atualizar unidade');
                    this.carregando = false;
                }
            });
            return;
        }

        this.unidadeService.create(dadosBackend as any).subscribe({
            next: () => {
                this.toastr.success('Unidade criada com sucesso!');
                this.voltar();
            },
            error: () => {
                this.toastr.error('Erro ao criar unidade');
                this.carregando = false;
            }
        });
    }

    voltar(): void {
        this.router.navigate(['/jm/cadastros/unidades']);
    }

    private mapStatusParaBackend(status: string): string {
        const statusMap: Record<string, string> = {
            disponivel: 'OPEN',
            reservada: 'RESERVED',
            vendida: 'SELL'
        };

        return statusMap[status] || status;
    }
}
