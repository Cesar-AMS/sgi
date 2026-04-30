import { DecimalPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Cliente } from 'src/app/models/ContaBancaria';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { PaginationComponent } from 'ngx-bootstrap/pagination';
import { ExportExcelService } from 'src/app/shared/export-excel.service';
import { finalize, of } from 'rxjs';
import { catchError, concatMap, switchMap, tap } from 'rxjs/operators';
import { CustomersService } from 'src/app/core/services/customers.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-list',
  providers: [DecimalPipe],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss',
})
export class ClientListComponent {
  textTitleModal: string = 'Novo Cliente';

  listClient: Cliente[] = [];
  cliente: Cliente = {} as Cliente;
  dependente: Cliente = {} as Cliente;
  clientsPage: Cliente[] = [];

  loading = false;

  clientFilter: any = { name: '' }


  dependent: boolean = false;

  @ViewChild('deleteRecordModal', { static: false })
  deleteRecordModal?: ModalDirective;
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('pager') pager?: PaginationComponent;

  constructor(
    private customersService: CustomersService,
    private http: HttpClient,
    public toast: ToastrService,
    private excel: ExportExcelService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loading = true;

    this.customersService.list().subscribe({
      next: (data) => {
        this.loading = false;
        this.listClient = data;
        this.clientsPage = this.listClient.slice(0, 10);
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  exportarExcel(): void {
    const data = this.listClient.map(e => ({
      ID: e.id,
      Nome: e.name,
      CPF: e.cpfCnpj,
      TELEFONE: e.cellphone,
      ENDEREÇO: e.address
    }));

    this.excel.exportJson(data, 'Lista de Clientes');
  }

  disableInputs: boolean = false;

  currentPage = 1;
  itemsPerPage = 10;

  private sortCol: keyof Cliente | '' = '';
  private sortDir: 1 | -1 = 1; // 1 = asc, -1 = desc

  ordenar(campo: keyof Cliente) {
    if (this.sortCol === campo) {
      this.sortDir = this.sortDir === 1 ? -1 : 1; // inverte ao clicar de novo
    } else {
      this.sortCol = campo;
      this.sortDir = 1; // primeira vez: asc
    }

    const dir = this.sortDir;

    this.filteredClients.sort((a, b) => {
      const va = this.normalize(a[campo], campo);
      const vb = this.normalize(b[campo], campo);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    this.refreshPage();

    // recorta a página atual (sem mexer na paginação)
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = this.currentPage * this.itemsPerPage;
    this.clientsPage = this.listClient.slice(start, end);

    this.applyFilter();

  }


  normalize(v: any, campo: keyof Cliente): any {
    if (v == null) return '';
    // trate campos numéricos aqui se quiser (ex.: id, addressNumber)
    if (campo === 'id' || campo === 'addressNumber') {
      const n = Number(String(v).replace(/[^\d.-]/g, ''));
      return isNaN(n) ? 0 : n;
    }
    return String(v)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  newClient() {
    this.loading = true;

    const main = this.sanitizeCliente(this.cliente);
    const hasDep = this.dependent && this.isFilledDependent(this.dependente);

    this.customersService.create(main).pipe(
      concatMap((createdMainId: number) => {
        if (!hasDep) return of({ createdMainId });

        const dep = this.sanitizeCliente(this.dependente);

        return this.customersService.create(dep).pipe(
          concatMap((depId: number) =>
            this.customersService.linkDependent(createdMainId, depId).pipe(
              switchMap(() => of({ createdMainId }))
            )
          )
        );
      }),
      tap(() => {
        this.toast.success('Cliente salvo com sucesso.', 'Sucesso!', { timeOut: 3000 });
        this.showModal?.hide();
        this.dependent = false;
        this.dependente = {} as Cliente;
      }),
      concatMap(() => this.customersService.list()),
      tap((data) => {
        this.listClient = data;
        this.currentPage = 1;
        this.clientsPage = this.listClient.slice(0, 10);
        this.pager?.selectPage(1);
      }),
      catchError((err) => {
        this.toast.error('Erro ao salvar cliente/dependente.', 'Erro!', { timeOut: 3000 });
        return of(null);
      }),
      finalize(() => (this.loading = false))
    ).subscribe();
  }

  private sanitizeCliente(c: Cliente): Cliente {
    return {
      ...c,
      name: (c.name || '').trim(),
      cpfCnpj: (c.cpfCnpj || '').trim(),
      email: (c.email || '').trim(),
      cellphone: (c.cellphone || '').trim(),
      cellphone2: (c.cellphone2 || '').trim(),
      cep: (c.cep || '').trim(),
      address: (c.address || '').trim(),
      addressNumber: (c.addressNumber || '').trim(),
      complement: (c.complement || '').trim(),
      neighborhood: (c.neighborhood || '').trim(),
      city: (c.city || '').trim(),
      state: (c.state || '').trim().toUpperCase(),
    };
  }

  private isFilledDependent(dep: Cliente): boolean {
    // mínimo para considerar que “tem dependente”
    return !!(dep?.name?.trim() || dep?.cpfCnpj?.trim() || dep?.email?.trim() || dep?.cellphone?.trim());
  }



  typeSalvarClient: 'new' | 'edit' = 'new';

  editClient() {
    this.loading = true;

    const payload: Cliente = {
      ...this.cliente,
      name: (this.cliente.name || '').trim(),
      cpfCnpj: (this.cliente.cpfCnpj || '').trim(),
      email: (this.cliente.email || '').trim(),
      cellphone: (this.cliente.cellphone || '').trim(),
      cellphone2: (this.cliente.cellphone2 || '').trim(),
      cep: (this.cliente.cep || '').trim(),
      address: (this.cliente.address || '').trim(),
      addressNumber: (this.cliente.addressNumber || '').trim(),
      complement: (this.cliente.complement || '').trim(),
      neighborhood: (this.cliente.neighborhood || '').trim(),
      city: (this.cliente.city || '').trim(),
      state: (this.cliente.state || '').trim().toUpperCase(),
    };

    this.customersService.update(payload).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Usuário atualizado com sucesso.', 'Sucesso!', {
          timeOut: 3000,
        });

        if (this.dependent) {
          if (this.dependente?.id == null || this.dependente?.id == 0 || this.dependente?.id == undefined) {
            
            this.customersService.create(this.dependente).pipe(
              concatMap((createdMainId: number) => {
                const dep = this.sanitizeCliente(this.dependente);

                return this.customersService.create(dep).pipe(
                  concatMap((depId: number) =>
                    this.customersService.linkDependent(createdMainId, depId).pipe(
                      switchMap(() => of({ createdMainId }))
                    )
                  )
                );
              }),)
          } else {
            this.customersService.update(payload).subscribe(
              {
                next: () => {
                  console.log('teste');
                }

              })
        }
        }


        this.customersService.list().subscribe((data) => {
          this.listClient = data;

          this.clientsPage = this.listClient.slice(0, 10);
          this.pager?.selectPage(1);
        });
      },
      error: (err) => {
        this.loading = false;
        this.toast.error('Erro ao atualizar dados do cliente', 'Erro!', {
          timeOut: 3000,
        });
      },
      complete: () => (this.loading = false),
    });
  }

  clientDelId: number = 0;

  openModalDel(id: number) {
    this.deleteRecordModal?.show();
    this.clientDelId = id
  }

  delClient() {
    this.loading = true
    this.customersService.delete(this.clientDelId).subscribe({
      next: () => {
        this.deleteRecordModal?.hide();
        this.loading = false
        this.toast.success('Usuário deletado com sucesso.', 'Sucesso!', {
          timeOut: 3000,
        });
        this.customersService.list().subscribe((data) => {
          this.listClient = data;

          this.clientsPage = this.listClient.slice(0, 10);
          this.pager?.selectPage(1);
        });
      },
    });
  }

  addDependent() {
    this.dependent = true;
    this.dependente = {} as Cliente;
  }

  removeDependent() {
    this.dependent = false;
    this.dependente = {} as Cliente;
  }

  novoCliente(): void {
    this.router.navigate(['/jm/cadastros/clientes/novo']);
  }

  editarCliente(id: number): void {
    this.router.navigate(['/jm/cadastros/clientes/editar', id]);
  }

  openModalEditClient(id: number) {
    this.editarCliente(id);
  }


  openModalNewClient() {
    this.novoCliente();
  }


  applyFilter(): void {
    const term = (this.clientFilter?.name ?? '').toString().trim().toLowerCase();

    // 1) filtra a lista completa
    this.filteredClients = !term
      ? [...this.listClient]
      : this.listClient.filter(c => {
        const blob = [
          c.id,
          c.name,
          c.cpfCnpj,
          c.cellphone,
          c.cellphone2,
          c.address,
          c.addressNumber,
          c.city,
          c.state,
        ]
          .filter(x => x != null)
          .join(' ')
          .toLowerCase();

        return blob.includes(term);
      });

    // 2) volta pra primeira página ao mudar o filtro
    this.currentPage = 1;

    // 3) aplica ordenação atual (se tiver)
    if (this.sortCol) {
      const campo = this.sortCol;
      const dir = this.sortDir;
      this.filteredClients.sort((a, b) => {
        const va = this.normalize(a[campo], campo);
        const vb = this.normalize(b[campo], campo);
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
    }

    // 4) recorta a página já em cima do filtrado
    this.refreshPage();
  }

  filteredClients: Cliente[] = [];

  private refreshPage(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = this.currentPage * this.itemsPerPage;
    this.clientsPage = this.filteredClients.slice(start, end);
  }

  loadingCep = false;

  buscarCep() {
    const cep = (this.cliente.cep || '').replace(/\D/g, '');
    if (cep.length !== 8) {
      alert('CEP inválido. Informe 8 dígitos.');
      return;
    }

    this.loadingCep = true;
    this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
      next: (res) => {
        if (res?.erro) {
          alert('CEP não encontrado.');
          return;
        }
        console.log('CEP', res)
        this.cliente.address = res.logradouro || '';
        this.cliente.complement = res.complemento || '';
        this.cliente.neighborhood = res.bairro || '';
        this.cliente.city = res.localidade || '';
        this.cliente.state = res.uf || '';
      },
      error: () => {
        alert('Erro ao consultar o CEP.');
      },
      complete: () => (this.loadingCep = false),
    });
  }

  pageChanged(event: any): void {
    this.currentPage = event.page;
    this.itemsPerPage = event.itemsPerPage;
    this.refreshPage();
  }
}
