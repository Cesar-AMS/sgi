import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/api.service';
import { UserMenuService } from 'src/app/core/services/user-menu.service';
import { AdminAccessService } from 'src/app/core/services/admin-access.service';
import { MENU } from 'src/app/layouts/sidebar/menu';
import { MenuItem } from 'src/app/layouts/sidebar/menu.model';
import {
  AccountPlains,
  CentroCusto,
  Cargos,
  Categories,
  Filial,
  Usuarios,
  FormasPagamento,
} from 'src/app/models/ContaBancaria';
import { ExportExcelService } from 'src/app/shared/export-excel.service';

export interface PermissionItem {
  key: string;        // link
  label: string;
  checked: boolean;
}

interface UsuarioPayload {
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  dataAdmissao: string | Date; // flatpickr pode retornar string/Date conforme config
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  email: string;
  senha: string;
  cargoId: string;
  filialId: string;
}

interface CargoPayload {
  nome: string;
  descricao?: string;
  nivelAcesso: string; // ex.: 'basico' | 'gerencia' | 'admin'
  status: boolean;
}



@Component({
  selector: 'app-gerais',
  templateUrl: './gerais.component.html',
  styleUrl: './gerais.component.scss',
})
export class GeraisComponent {
  menuItems: MenuItem[] = [];

  


  permissoes: {
  dashboard: PermissionItem[];
  vendas: PermissionItem[];
  financeiro: PermissionItem[];
  empreendimentos: PermissionItem[];
  gerais: PermissionItem[];
  outros: PermissionItem[];
} = {
  dashboard: [],
  vendas: [],
  financeiro: [],
  empreendimentos: [],
  gerais: [],
  outros: []
};

  MenuDefault: MenuItem[] = MENU


  private extractUserLinks(menu: MenuItem[]): Set<string> {
    const links = new Set<string>();

    const walk = (items: MenuItem[]) => {
      for (const item of items) {
        if (item.link) links.add(item.link);
        if (item.subItems?.length) walk(item.subItems);
      }
    };

    walk(menu);
    return links;
  }

  private buildPermissions(userMenu: MenuItem[]) {
  const userLinks = this.extractUserLinks(userMenu); // Set<string> com links do usuário
  const clickable = this.extractClickableItems(this.MenuDefault); // ✅ aqui vem os subItems também
  console.log('CLICKABLE ITEMS', clickable.map(x => x.link));

  this.resetPermissoes();

  for (const item of clickable) {
    const perm: PermissionItem = {
      key: item.link!,      // link é a chave
      label: item.label ?? '',    // label é o texto (pode ser translate)
      checked: userLinks.has(item.link!)
    };

    // categorização (ajuste conforme seus links)
    const link = item.link!;

    if (link.startsWith('/vendas') || link.startsWith('jm/vendas') || link.startsWith('jm/leads')) {
      this.permissoes.vendas.push(perm);
    } else if (link.startsWith('jm/financeiro')) {
      this.permissoes.financeiro.push(perm);
    } else if (link.startsWith('/construtora') || link.startsWith('/empreendimentos') || link.startsWith('/unidades')) {
      this.permissoes.empreendimentos.push(perm);
    } else if (link.startsWith('/clientes') || link.startsWith('/visitas')) {
      this.permissoes.gerais.push(perm);
    } else if (link.startsWith('/settings')) {
      this.permissoes.outros.push(perm);
    } else {
      this.permissoes.dashboard.push(perm);
    }
  }
}


private resetPermissoes() {
  this.permissoes.dashboard = [];
  this.permissoes.vendas = [];
  this.permissoes.financeiro = [];
  this.permissoes.empreendimentos = [];
  this.permissoes.gerais = [];
  this.permissoes.outros = [];
}
  private flattenMenu(menu: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];

    const walk = (items: MenuItem[]) => {
      for (const item of items) {
        if (item.link) result.push(item);
        if (item.subItems?.length) walk(item.subItems);
      }
    };

    walk(menu);
    return result;
  }


loadUserMenu(userId: number) {
  this.userMenuService
    .getUserMenu(userId)
    .subscribe(userMenu => {

      // ✅ se vier vazio/null → usa default
      const menu = userMenu && userMenu.length
        ? userMenu
        : MENU;

      this.buildPermissions(menu);
    });
}

  @ViewChild('modalFilial', { static: false }) modalFilial?: ModalDirective;
  @ViewChild('modalUsers', { static: false }) modalUsers?: ModalDirective;
  @ViewChild('modalCargo', { static: false }) modalCargo?: ModalDirective;
  @ViewChild('modalCategories', { static: false })
  modalCategories?: ModalDirective;
  @ViewChild('modalAccPlan', { static: false }) modalAccPlan?: ModalDirective;
  @ViewChild('modalCC', { static: false }) modalCC?: ModalDirective;
  @ViewChild('modalFF') modalFF?: ModalDirective;
 @ViewChild('criarCargo', { static: false }) criarCargo?: ModalDirective;

  cargo = {
    nome: '',
    permissoes: {},
  };

  coordenatorsAll: Usuarios[] = [];
  filiais: Filial[] = [];
  usuarios: Usuarios[] = [];
  gerentes: Usuarios[] = [];
  modeUser: string = '';
  modeFilial: string = '';
  modeCategoria: string = '';

  filterFilial: any = { name: '' }
  filterCategory: any = { description: '' }
  filterUser: any = { name: '' };
  cargos: Cargos[] = [];
  categories: Categories[] = [];
  formasPagamento: FormasPagamento[] = [];
  statusFilter: string = 'active';
  centroCusto: CentroCusto[] = [];
  planAcc: AccountPlains[] = [];
  mode: 'new' | 'edit' = 'new';
  filialForm: Filial = {} as Filial;
  userForm: Usuarios = {} as Usuarios;
  cargoForm: Cargos = {} as Cargos;
  categoriesForm: Categories = {} as Categories;
  planAccForm: AccountPlains = {} as AccountPlains;
  centroCustoForm: CentroCusto = {} as CentroCusto;
  formasPagamentoForm: FormasPagamento = {} as FormasPagamento;

  trackByIdCargo(_: number, c: Cargos) {
    return c.id;
  }
  trackById(_: number, u: Usuarios) {
    return u.id;
  }
  currentTab = 'filial';
  disableInputs: boolean = false;

  cargosSelect: Cargos[] = [];
  filiaisSelect: Filial[] = [];

  niveisSelect = [
    { label: 'Corretor' },
    { label: 'Gerente' },
    { label: 'Administrador' },
  ];

  constructor(private service: ApiService, 
    private adminAccessService: AdminAccessService,
    private excel: ExportExcelService, 
    private toast: ToastrService, 
    public translate: TranslateService,
    private userMenuService: UserMenuService) {
       translate.setDefaultLang('en');
     }

  loading = false;

  patchUser() {
    this.adminAccessService.updateUser(this.userForm).subscribe({
      next: () => {
        this.toast.success('Atualizado com sucesso'),
          this.adminAccessService.listUsersByStatus(this.statusFilter).subscribe((data) => {
            this.usuarios = data;
          });

        this.modalUsers?.hide()
      },
      error: (err) => console.error(err),
    });
  }


  addUser() {
    this.adminAccessService.createUser(this.userForm).subscribe({
      next: () => {
        this.toast.success('Adicionado com sucesso'),
          this.adminAccessService.listUsersByStatus(this.statusFilter).subscribe((data) => {
            this.usuarios = data;
          });

        this.modalUsers?.hide()
      },
      error: (err) => console.error(err),
    });
  }

  openModalUser(mode: 'edit' | 'new', id?: number) {
    if (mode === 'new') {
      this.modeUser = 'new'
      this.userForm = {} as Usuarios;
      this.modalUsers?.show();
      return;
    }

    if (mode === 'edit') {
      this.adminAccessService.getUserById(id!).subscribe({
        next: (d: Usuarios) => {
          d.password = ''
          this.userForm = d;
          this.modeUser = 'edit'
          this.modalUsers?.show();
        },
      });
    }
  }

  removeFilial(id: any) {

    this.adminAccessService.deleteBranch(id).subscribe({
      next: () => {
        this.toast.success('Removido com sucesso'),
          this.modalFilial?.hide(),
          this.adminAccessService.listBranches().subscribe((data) => {
            this.filiais = data;
            this.filiaisSelect = data;
          });
      },
      error: (err) => this.toast.error(err)
    })
  }

  addFilial() {
    this.adminAccessService.createBranch(this.filialForm).subscribe({
      next: () => {
        this.toast.success('Salvo com sucesso'),
          this.modalFilial?.hide(),
          this.adminAccessService.listBranches().subscribe((data) => {
            this.filiais = data;
            this.filiaisSelect = data;
          });
      },
      error: (err) => console.error(err),
    });
  }

  updateFilial() {
    this.adminAccessService.updateBranch(this.filialForm).subscribe({
      next: () => {
        this.toast.success('Salvo com sucesso'),
          this.modalFilial?.hide(),
          this.adminAccessService.listBranches().subscribe((data) => {
            this.filiais = data;
            this.filiaisSelect = data;
          });
      },
      error: (err) => console.error(err),
    });
  }

  openModalFilial(mode: 'edit' | 'new', id?: number) {
    if (mode === 'new') {
      this.modeFilial = 'new';
      this.filialForm = {} as Filial;
      this.modalFilial?.show();
      return;
    }

    if (mode === 'edit') {
      this.modeFilial = 'edit';
      this.adminAccessService.getBranchById(id!).subscribe({
        next: (d: Filial) => {
          this.filialForm = d;
          this.modalFilial?.show();
        },
      });
    }
  }

  updateCategories() {

    var obj = {
      id: this.categoriesForm.id,
      description: this.categoriesForm.description,
      status: this.categoriesForm.status
    }

    this.service.putCategories(this.categoriesForm.id, obj).subscribe({
      next: () => {
        this.toast.success('Categoria atualizada com sucesso')
        this.service.getCategories().subscribe((data: any) => {
          this.categories = data;
        });

        this.modalCategories?.hide()
      },
      error: (err) => console.error(err),
    });
  }

  addCategories() {
    this.service.postCategories(this.categoriesForm).subscribe({
      next: () => {
        this.toast.success('Categoria salva com sucesso')
        this.service.getCategories().subscribe((data: any) => {
          this.categories = data;
        });
        this.modalCategories?.hide()

      },
      error: (err) => console.error(err),
    });
  }

  openModalCategories(mode: 'edit' | 'new', id?: number) {
    if (mode === 'new') {
      this.modeCategoria = 'new'
      this.categoriesForm = {} as Categories;
      this.modalCategories?.show();
      return;
    }

    if (mode === 'edit') {
      this.modeCategoria = 'edit'
      this.service.getCategoriesById(id!).subscribe({
        next: (d: Categories) => {
          this.categoriesForm = d;
          this.modeUser = 'edit'
          this.modalCategories?.show();
        },
      });
    }
  }

  addPlanAcc() {
    this.service.postAccPlan(this.planAccForm).subscribe({
      next: () => { },
      error: (err) => console.error(err),
    });
  }

  openModalPlanAcc(mode: 'edit' | 'new', id?: number) {
    if (mode === 'new') {
      this.planAccForm = {} as AccountPlains;
      this.modalAccPlan?.show();
      return;
    }

    if (mode === 'edit') {
      this.service.getAccPlanById(id!).subscribe({
        next: (d: AccountPlains) => {
          this.planAccForm = d;
          this.modalAccPlan?.show();
        },
      });
    }
  }

  addCargo() {
    this.adminAccessService.createRole(this.cargoForm).subscribe({
      next: () => { },
      error: (err) => console.error(err),
    });
  }

  openModalCargo(mode: 'edit' | 'new', id?: number) {
    if (mode === 'new') {
      this.cargoForm = {} as Cargos;
      this.modalCargo?.show();
      return;
    }

    if (mode === 'edit') {
      this.adminAccessService.getRoleById(id!).subscribe({
        next: (d: Cargos) => {
          this.cargoForm = d;
          this.modalCargo?.show();
        },
      });
    }
  }

  addCC() {
    this.service.postCentroCusto(this.centroCustoForm).subscribe({
      next: () => {

        this.toast.success('Salvo com sucesso'),
          this.modalCC?.hide()

      },
      error: (err) => console.error(err),
    });
  }

  openModalCC(mode: 'edit' | 'new', id?: number) {
    if (mode === 'new') {
      this.centroCustoForm = {} as CentroCusto;
      this.modalCC?.show();
      return;
    }

    if (mode === 'edit') {
      this.service.getCentroCustoById(id!).subscribe({
        next: (d: CentroCusto) => {
          this.centroCustoForm = d;
          this.modalCC?.show();
        },
      });
    }
  }

  addFF() {
    this.service.postFormasPagamento(this.formasPagamentoForm).subscribe({
      next: () => {

        this.service.getFormasPagamento().subscribe((data) => {
          this.formasPagamento = data;
        });
        this.toast.success('Forma de pagamento adicionada com sucesso!')
        this.modalFF?.hide()
      },
      error: (err) => console.error(err),
    });
  }

  editFF() {
    this.service.putFormasPagamento(this.formasPagamentoForm).subscribe({
      next: () => {
        this.service.getFormasPagamento().subscribe((data) => {
          this.formasPagamento = data;
        });
        this.toast.success('Forma de pagamento editada com sucesso!')
        this.modalFF?.hide()
      },
      error: (err) => console.error(err)
    })
  }

  titleFF: 'Nova' | 'Editar' = 'Nova'



  openModalFF(mode: 'edit' | 'new', id?: number) {
    if (mode === 'new') {
      this.titleFF = 'Nova'
      this.formasPagamentoForm = {} as FormasPagamento;
      console.log(this.formasPagamentoForm)
      this.modalFF?.show();
      return;
    }

    if (mode === 'edit') {
      this.titleFF = 'Editar'
      this.service.getFormasPagamentoById(id!).subscribe({
        next: (d: FormasPagamento) => {
          this.formasPagamentoForm = d;
          this.modalFF?.show();
        },
      });
    }
  }

  ngOnInit() {
    this.service.getCentroCusto().subscribe((data) => {
      this.centroCusto = data;
    });

    this.service.getFormasPagamento().subscribe((data) => {
      this.formasPagamento = data;
    });

    this.adminAccessService.listBranches().subscribe((data) => {
      this.filiais = data;
      this.filiaisSelect = data;
    });

    this.adminAccessService.listUsersByStatus(this.statusFilter).subscribe((data) => {
      this.usuarios = data;
    });

    this.adminAccessService.listRoles().subscribe((data) => {
      this.cargos = data;
      this.cargosSelect = data;
    });

    this.service.getCategories().subscribe((data: any) => {
      this.categories = data;
    });

    this.service.getAccPlan().subscribe((data: any) => {
      this.planAcc = data;
    });

    this.service.getCoordenadores().subscribe((data) => {
      this.coordenatorsAll = data
    });


    this.service.getGerentes().subscribe((data) => {
      this.gerentes = data
    });
  }

  userId: number = 0;



openCriarCargoModal(userId: number) {
  this.userId = userId;
  this.resetPermissoes();

  this.loadUserMenu(userId);
  this.criarCargo?.show()
}

private extractClickableItems(menu: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = [];

  const walk = (items: MenuItem[]) => {
    for (const item of items) {
      // pega somente itens que o usuário consegue clicar (tem link)
      if (item.link) result.push(item);

      // entra nos filhos sempre
      if (item.subItems?.length) walk(item.subItems);
    }
  };

  walk(menu);
  return result;
}
  savePermissions() {
    const menuJson = this.buildMenuFromPermissions();
    
    this.userMenuService.updateUserMenu(this.userId, menuJson)
      .subscribe(() => {
        this.criarCargo?.hide();
      });
  }

  private buildMenuFromPermissions(): MenuItem[] {
    const allowedLinks = new Set(this.getCheckedLinks());

    const cloneAndFilter = (items: MenuItem[]): MenuItem[] => {
      return items
        .map(item => ({
          ...item,
          subItems: item.subItems ? cloneAndFilter(item.subItems) : undefined
        }))
        .filter(item =>
          item.isTitle ||
          item.link && allowedLinks.has(item.link) ||
          item.subItems?.length
        );
    };

    return cloneAndFilter(this.MenuDefault);
  }

  private getCheckedLinks(): string[] {
    return Object.values(this.permissoes)
      .flat()
      .filter(p => p.checked)
      .map(p => p.key);
  }


  changeTab(tab: string) {
    this.currentTab = tab;
  }

  changeStatus() {
    this.adminAccessService.listUsersByStatus(this.statusFilter).subscribe((data) => {
      this.usuarios = data;
    });
  }

  exportarExcel(list: string): void {
    if (list === 'users') {
      const data = this.usuarios.map((e) => ({
        ID: e.id,
        Nome: e.name,
        Telefone: e.cellphone,
        CPF: e.cpf,
        Email: e.email,
        DataCriacao: e.createdAt
      }));
      this.excel.exportJson(data, 'Lista de Usuários');
      return;
    }

    if (list === 'categories') {
      const data = this.categories.map((e) => ({
        ID: e.id,
        Descrição: e.description,
        Status: e.status ? 'Ativo' : 'Inativo',
      }));
      this.excel.exportJson(data, 'Lista de Categorias');
      return;
    }

    if (list === 'planAcc') {
      const data = this.planAcc.map((e) => ({
        ID: e.id,
        Conta: e.account,
        Descricao: e.description,
        IdCategoria: e.idCategory,
        TipoAcc: e.typeAccount,
      }));
      this.excel.exportJson(data, 'Lista de Plano de Contas');
      return;
    }

    if (list === 'CC') {
      const data = this.centroCusto.map((e) => ({
        ID: e.id,
        Nome: e.name,
        Status: e.status ? 'Ativo' : 'Inativo',
      }));
      this.excel.exportJson(data, 'Lista de Centro de Custos');
      return;
    }
  }
}
