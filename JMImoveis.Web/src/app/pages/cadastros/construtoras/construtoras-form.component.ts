import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConstrutoraService } from '../../../services/construtora.service';

@Component({
    selector: 'app-construtoras-form',
    templateUrl: './construtoras-form.component.html',
    styleUrls: ['./construtoras-form.component.scss']
})
export class ConstrutorasFormComponent implements OnInit {
    form: FormGroup;
    id: number | null = null;
    editando = false;
    carregando = false;
    bancos = [
        'Banco do Brasil',
        'Bradesco',
        'Caixa Economica Federal',
        'Itau',
        'Santander',
        'Safra',
        'Sicoob',
        'Sicredi',
        'Banco Inter',
        'Nubank',
        'Outro'
    ];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private construtoraService: ConstrutoraService,
        private toastr: ToastrService
    ) {
        this.form = this.fb.group({
            nome: ['', [Validators.required, Validators.minLength(3)]],
            endereco: [''],
            telefone: [''],
            celular: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            site: [''],
            cnpj: ['', [Validators.required]],
            inscricaoEstadual: [''],
            inscricaoMunicipal: [''],
            banco: [''],
            agencia: [''],
            conta: [''],
            pix: [''],
            responsavel: [''],
            observacoes: ['']
        });
    }

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.id = parseInt(idParam, 10);
            this.editando = true;
            this.carregarConstrutora();
        }
    }

    carregarConstrutora(): void {
        if (!this.id) return;

        this.carregando = true;
        this.construtoraService.getById(this.id).subscribe({
            next: (data) => {
                this.form.patchValue({
                    nome: data.nome,
                    endereco: data.endereco,
                    telefone: data.telefone,
                    celular: data.celular,
                    email: data.email,
                    site: data.site,
                    cnpj: data.cnpj,
                    inscricaoEstadual: data.inscricaoEstadual,
                    inscricaoMunicipal: data.inscricaoMunicipal,
                    banco: data.banco,
                    agencia: data.agencia,
                    conta: data.conta,
                    pix: data.pix,
                    responsavel: data.responsavel,
                    observacoes: data.observacoes
                });
                this.carregando = false;
            },
            error: () => {
                this.toastr.error('Erro ao carregar construtora');
                this.carregando = false;
                this.voltar();
            }
        });
    }

    salvar(): void {
        if (this.form.invalid) {
            this.toastr.warning('Preencha todos os campos obrigatórios');
            return;
        }

        this.carregando = true;
        const dadosFront = this.form.value;
        const dadosBackend = {
            name: dadosFront.nome,
            address: dadosFront.endereco,
            phone: dadosFront.telefone,
            cellphone: dadosFront.celular,
            email: dadosFront.email,
            site: dadosFront.site,
            cnpj: dadosFront.cnpj,
            stateRegistration: dadosFront.inscricaoEstadual,
            municipalRegistration: dadosFront.inscricaoMunicipal,
            bank: dadosFront.banco,
            agency: dadosFront.agencia,
            account: dadosFront.conta,
            pix: dadosFront.pix,
            responsible: dadosFront.responsavel,
            observations: dadosFront.observacoes
        };

        if (this.editando && this.id) {
            this.construtoraService.update(this.id, dadosBackend as any).subscribe({
                next: () => {
                    this.toastr.success('Construtora atualizada com sucesso!');
                    this.voltar();
                },
                error: () => {
                    this.toastr.error('Erro ao atualizar construtora');
                    this.carregando = false;
                }
            });
        } else {
            this.construtoraService.create(dadosBackend as any).subscribe({
                next: () => {
                    this.toastr.success('Construtora criada com sucesso!');
                    this.voltar();
                },
                error: () => {
                    this.toastr.error('Erro ao criar construtora');
                    this.carregando = false;
                }
            });
        }
    }

    voltar(): void {
        this.router.navigate(['/jm/cadastros/construtoras']);
    }
}
