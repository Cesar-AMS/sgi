import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CustomersService } from 'src/app/core/services/customers.service';
import { Cliente } from 'src/app/models/ContaBancaria';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-clientes-form',
    template: `
        <div class="cadastros-form-container">
            <div class="header">
                <h2>{{ editando ? 'Editar' : 'Novo' }} Cliente</h2>
                <button class="btn-voltar" type="button" (click)="voltar()">Voltar</button>
            </div>

            <div class="form-container" *ngIf="!carregando">
                <form [formGroup]="form" (ngSubmit)="salvar()">
                    <section class="form-section">
                        <h3>Dados do Cliente</h3>

                        <div class="form-grid">
                            <div class="form-group span-6">
                                <label for="nome">Nome *</label>
                                <input id="nome" type="text" class="form-control" formControlName="name" placeholder="Nome do cliente">
                                <div class="erro" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
                                    Nome e obrigatorio
                                </div>
                            </div>

                            <div class="form-group span-3">
                            <label for="cpfCnpj">CPF/CNPJ *</label>
                            <input id="cpfCnpj" type="text" class="form-control" formControlName="cpfCnpj" placeholder="CPF ou CNPJ">
                            <div class="erro" *ngIf="form.get('cpfCnpj')?.invalid && form.get('cpfCnpj')?.touched">
                                CPF/CNPJ e obrigatorio
                            </div>
                        </div>

                            <div class="form-group span-3">
                            <label for="cellphone">Telefone</label>
                            <input id="cellphone" type="tel" class="form-control" formControlName="cellphone" placeholder="(11) 98765-4321">
                        </div>
                        </div>
                    </section>

                    <section class="form-section">
                        <h3>Endereco</h3>

                        <div class="form-grid">
                            <div class="form-group span-2">
                            <label for="cep">CEP</label>
                            <input id="cep" type="text" class="form-control" formControlName="cep" placeholder="00000-000">
                        </div>

                            <div class="form-group span-2">
                            <label for="addressNumber">Numero</label>
                            <input id="addressNumber" type="text" class="form-control" formControlName="addressNumber" placeholder="123">
                        </div>

                            <div class="form-group span-8">
                        <label for="address">Endereco</label>
                        <input id="address" type="text" class="form-control" formControlName="address" placeholder="Endereco">
                    </div>

                            <div class="form-group span-4">
                            <label for="neighborhood">Bairro</label>
                            <input id="neighborhood" type="text" class="form-control" formControlName="neighborhood" placeholder="Bairro">
                        </div>

                            <div class="form-group span-5">
                            <label for="city">Cidade</label>
                            <input id="city" type="text" class="form-control" formControlName="city" placeholder="Cidade">
                        </div>

                            <div class="form-group span-3">
                            <label for="state">Estado</label>
                            <input id="state" type="text" class="form-control" formControlName="state" maxlength="2" placeholder="UF">
                        </div>
                        </div>
                    </section>

                    <div class="form-actions">
                        <button type="button" class="btn-cancelar" (click)="voltar()">Cancelar</button>
                        <button type="submit" class="btn-salvar" [disabled]="form.invalid">Salvar</button>
                    </div>
                </form>
            </div>

            <div class="loading" *ngIf="carregando">
                Carregando...
            </div>
        </div>
    `,
    styles: [`
        .cadastros-form-container {
            padding: 20px;
            width: 100%;
            max-width: 1320px;
            margin: 0 auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 18px;
        }

        .header h2 {
            margin: 0;
        }

        .btn-voltar {
            background: none;
            border: none;
            color: #007bff;
            cursor: pointer;
            font-size: 16px;
        }

        .btn-voltar:hover {
            text-decoration: underline;
        }

        .form-container {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .form-section {
            padding-bottom: 14px;
            margin-bottom: 14px;
            border-bottom: 1px solid #eef0f3;
        }

        .form-section:last-of-type {
            border-bottom: 0;
            margin-bottom: 0;
        }

        .form-section h3 {
            margin: 0 0 12px;
            color: #333;
            font-size: 16px;
            font-weight: 700;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(12, minmax(0, 1fr));
            column-gap: 16px;
            row-gap: 12px;
        }

        .form-group {
            margin-bottom: 0;
            min-width: 0;
        }

        .span-2 {
            grid-column: span 2;
        }

        .span-3 {
            grid-column: span 3;
        }

        .span-4 {
            grid-column: span 4;
        }

        .span-5 {
            grid-column: span 5;
        }

        .span-6 {
            grid-column: span 6;
        }

        .span-8 {
            grid-column: span 8;
        }

        label {
            display: block;
            margin-bottom: 6px;
            font-weight: bold;
        }

        .form-control {
            width: 100%;
            min-height: 38px;
            padding: 8px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }

        .form-control:focus {
            outline: none;
            border-color: #007bff;
        }

        .erro {
            color: #dc3545;
            font-size: 12px;
            margin-top: 4px;
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 18px;
        }

        .form-actions button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        .btn-cancelar {
            background-color: #6c757d;
            color: white;
        }

        .btn-salvar {
            background-color: #007bff;
            color: white;
        }

        .btn-salvar:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }

        @media (max-width: 991px) {
            .span-2,
            .span-3,
            .span-4,
            .span-5,
            .span-6,
            .span-8 {
                grid-column: span 6;
            }
        }

        @media (max-width: 640px) {
            .header,
            .form-actions {
                align-items: flex-start;
                flex-direction: column;
            }

            .form-grid {
                grid-template-columns: 1fr;
            }

            .span-2,
            .span-3,
            .span-4,
            .span-5,
            .span-6,
            .span-8 {
                grid-column: span 1;
            }

            .form-actions button {
                width: 100%;
            }
        }
    `]
})
export class ClientesFormComponent implements OnInit {
    form: FormGroup;
    id: number | null = null;
    editando = false;
    carregando = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private customersService: CustomersService,
        private toastr: ToastrService
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            cpfCnpj: ['', [Validators.required]],
            cellphone: [''],
            address: [''],
            addressNumber: [''],
            neighborhood: [''],
            city: [''],
            state: [''],
            cep: ['']
        });
    }

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.id = parseInt(idParam, 10);
            this.editando = true;
            this.carregarCliente();
        }
    }

    carregarCliente(): void {
        if (!this.id) return;

        this.carregando = true;
        this.customersService.getById(this.id).subscribe({
            next: (cliente) => {
                this.form.patchValue({
                    name: cliente.name,
                    cpfCnpj: cliente.cpfCnpj,
                    cellphone: cliente.cellphone,
                    address: cliente.address,
                    addressNumber: cliente.addressNumber,
                    neighborhood: cliente.neighborhood,
                    city: cliente.city,
                    state: cliente.state,
                    cep: cliente.cep
                });
                this.carregando = false;
            },
            error: () => {
                this.toastr.error('Erro ao carregar cliente');
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
        const payload = this.montarPayload();

        const request$: Observable<unknown> = this.editando
            ? this.customersService.update(payload)
            : this.customersService.create(payload);

        request$.subscribe({
            next: () => {
                this.toastr.success(this.editando ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
                this.voltar();
            },
            error: () => {
                this.toastr.error(this.editando ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente');
                this.carregando = false;
            }
        });
    }

    voltar(): void {
        this.router.navigate(['/jm/clientes']);
    }

    private montarPayload(): Cliente {
        const value = this.form.value;
        return {
            id: this.id ?? 0,
            name: (value.name || '').trim(),
            cpfCnpj: (value.cpfCnpj || '').trim(),
            email: '',
            cellphone: (value.cellphone || '').trim(),
            cellphone2: '',
            cep: (value.cep || '').trim(),
            address: (value.address || '').trim(),
            addressNumber: (value.addressNumber || '').trim(),
            complement: '',
            neighborhood: (value.neighborhood || '').trim(),
            city: (value.city || '').trim(),
            state: (value.state || '').trim().toUpperCase(),
            type: '',
            profession: '',
            income: '',
            idTitular: 0
        };
    }
}
