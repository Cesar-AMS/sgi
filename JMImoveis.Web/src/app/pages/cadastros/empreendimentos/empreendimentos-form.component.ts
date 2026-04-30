import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EmpreendimentoService } from '../../../services/empreendimento.service';
import { ConstrutoraService } from '../../../services/construtora.service';
import { Construtora } from '../../../models/construtora.model';

@Component({
    selector: 'app-empreendimentos-form',
    templateUrl: './empreendimentos-form.component.html',
    styleUrls: ['./empreendimentos-form.component.scss']
})
export class EmpreendimentosFormComponent implements OnInit {
    form: FormGroup;
    id: number | null = null;
    editando = false;
    carregando = false;
    construtoras: Construtora[] = [];
    tipoOptions = [
        { value: 'RESIDENCIAL', label: 'Residencial' },
        { value: 'COMERCIAL', label: 'Comercial' },
        { value: 'MISTO', label: 'Misto' }
    ];
    statusOptions = [
        { value: 'LANCAMENTO', label: 'Lancamento' },
        { value: 'EM_OBRA', label: 'Em Obra' },
        { value: 'PRONTO', label: 'Pronto para Entregar' },
        { value: 'ENTREGUE', label: 'Entregue' }
    ];
    ufOptions = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private empreendimentoService: EmpreendimentoService,
        private construtoraService: ConstrutoraService,
        private toastr: ToastrService
    ) {
        this.form = this.fb.group({
            nome: ['', [Validators.required, Validators.minLength(3)]],
            endereco: ['', [Validators.required]],
            construtoraId: [null, [Validators.required]],
            telefone: [''],
            email: ['', [Validators.email]],
            cidade: ['', [Validators.required]],
            estado: ['', [Validators.required]],
            cep: [''],
            bairro: [''],
            tipo: ['RESIDENCIAL', [Validators.required]],
            status: ['LANCAMENTO', [Validators.required]],
            numeroTorres: [null],
            numeroUnidades: [null],
            areaTotal: [null],
            dataLancamento: [''],
            dataEntregaPrevista: [''],
            incorporador: [''],
            cnpjIncorporador: [''],
            registroCRI: [''],
            alvaraNumero: [''],
            habitese: [''],
            dataAprovacao: [''],
            responsavelTecnico: [''],
            descricao: [''],
            observacoes: ['']
        });
    }

    ngOnInit(): void {
        this.carregarConstrutoras();

        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.id = parseInt(idParam, 10);
            this.editando = true;
            this.carregarEmpreendimento();
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

    carregarEmpreendimento(): void {
        if (!this.id) return;

        this.carregando = true;
        this.empreendimentoService.getById(this.id).subscribe({
            next: (data: any) => {
                this.form.patchValue({
                    nome: data.nome ?? data.name,
                    endereco: data.endereco ?? data.address,
                    construtoraId: data.construtoraId ?? data.constructorId,
                    telefone: data.telefone,
                    email: data.email,
                    cidade: data.cidade,
                    estado: data.estado,
                    cep: data.cep,
                    bairro: data.bairro,
                    tipo: data.tipo,
                    status: data.status,
                    numeroTorres: data.numeroTorres,
                    numeroUnidades: data.numeroUnidades,
                    areaTotal: data.areaTotal,
                    dataLancamento: this.toDateInput(data.dataLancamento),
                    dataEntregaPrevista: this.toDateInput(data.dataEntregaPrevista),
                    incorporador: data.incorporador,
                    cnpjIncorporador: data.cnpjIncorporador,
                    registroCRI: data.registroCRI,
                    alvaraNumero: data.alvaraNumero,
                    habitese: data.habitese,
                    dataAprovacao: this.toDateInput(data.dataAprovacao),
                    responsavelTecnico: data.responsavelTecnico,
                    descricao: data.descricao,
                    observacoes: data.observacoes
                });
                this.carregando = false;
            },
            error: () => {
                this.toastr.error('Erro ao carregar empreendimento');
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
            name: dadosFront.nome,
            address: dadosFront.endereco,
            constructorId: Number(dadosFront.construtoraId),
            phone: dadosFront.telefone,
            email: dadosFront.email,
            city: dadosFront.cidade,
            state: dadosFront.estado,
            zipCode: dadosFront.cep,
            neighborhood: dadosFront.bairro,
            type: dadosFront.tipo,
            workStatus: dadosFront.status,
            towersNumber: dadosFront.numeroTorres,
            unitsNumber: dadosFront.numeroUnidades,
            totalArea: dadosFront.areaTotal,
            launchDate: dadosFront.dataLancamento || null,
            expectedDeliveryDate: dadosFront.dataEntregaPrevista || null,
            developer: dadosFront.incorporador,
            developerCnpj: dadosFront.cnpjIncorporador,
            criRegistration: dadosFront.registroCRI,
            permitNumber: dadosFront.alvaraNumero,
            habiteSe: dadosFront.habitese,
            approvalDate: dadosFront.dataAprovacao || null,
            technicalResponsible: dadosFront.responsavelTecnico,
            description: dadosFront.descricao,
            observations: dadosFront.observacoes
        };

        if (this.editando && this.id) {
            this.empreendimentoService.update(this.id, dadosBackend as any).subscribe({
                next: () => {
                    this.toastr.success('Empreendimento atualizado com sucesso!');
                    this.voltar();
                },
                error: () => {
                    this.toastr.error('Erro ao atualizar empreendimento');
                    this.carregando = false;
                }
            });
        } else {
            this.empreendimentoService.create(dadosBackend as any).subscribe({
                next: () => {
                    this.toastr.success('Empreendimento criado com sucesso!');
                    this.voltar();
                },
                error: () => {
                    this.toastr.error('Erro ao criar empreendimento');
                    this.carregando = false;
                }
            });
        }
    }

    voltar(): void {
        this.router.navigate(['/jm/cadastros/empreendimentos']);
    }

    private toDateInput(value: Date | string | null | undefined): string {
        if (!value) return '';
        return String(value).slice(0, 10);
    }
}
