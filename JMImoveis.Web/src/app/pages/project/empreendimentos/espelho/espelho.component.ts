import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ModalVendaComponent } from '../../modal-venda/modal-venda.component';
import { Apartamento } from 'src/app/core/data/empreendimento';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Construtoras, Empreendimento, Filial, Usuarios } from 'src/app/models/ContaBancaria';
import { ApiService } from 'src/app/core/services/api.service';
import { ProposalsService } from 'src/app/core/services/proposals.service';
import { AuthUserInfo, AuthenticationService } from 'src/app/core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import moment from 'moment';
import { PropostaReserva } from 'src/app/models/proposta-reserva';


export interface Comprador {
  nome: string;
  cpf: string;
  nasc: string;
  rg: string;
  email: string;
  tel1: string;
  tel2?: string;
  civil?: string;
  profissao?: string;
  renda?: string;
}


function dataPorExtenso(cidade = 'São Paulo', data = new Date()): string {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeZone: 'America/Sao_Paulo'
  }).format(data); // ex.: "03 de agosto de 2025"
  return `${cidade}, ${texto}.`;
}

const formatBRL = (v: number | string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v));

export interface Endereco {
  cep?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface Condicao {
  qtde: number;
  descricao: string;
  vencimento: string;      // formato yyyy-MM-dd
  valorParcela: number;
  valorTotal: number;      // calculado
}

export interface Proposta {
  empreendimento: string;
  unidade: string;
  bloco: string;

  comprador1: Comprador;
  comprador2: Comprador;

  endereco: Endereco;

  condicoes: Condicao[];
}

type Grupo = {
  bloco: string;
  andares: { andar: number; unidades: Apartamento[] }[];
};

type GrupoAndar = { andar: number; unidades: Apartamento[] };
type GrupoBloco = { bloco: string; andares: GrupoAndar[] };

@Component({
  selector: 'app-espelho',
  templateUrl: './espelho.component.html',
  styleUrl: './espelho.component.scss',
})

export class EspelhoComponent implements OnInit, OnChanges {

  @ViewChild('meuModal', { static: false }) meuModal!: ModalVendaComponent;
  @ViewChild('modalReserva', { static: false }) modalReserva!: ModalDirective;

  @ViewChild('areaA4Ref', { static: false }) areaA4Ref!: ElementRef;

  @Input() modo: 'criacao' | 'visualizacao' = 'criacao';
  @Input() propostaId?: number;
  @Output() propostaAtualizada = new EventEmitter<void>();
  @Output() fechado = new EventEmitter<void>();

  grupos: GrupoBloco[] = [];
  construtora: Construtoras[] = [];
  empreendimentos: Empreendimento[] = [];
  condicoes: Condicao[] = [];
  filiais: Filial[] = [];
  unidadeSelecionada: string = '';
  mostrarSegundoProponente: boolean = false;
  mesmoEndereco: boolean = true;
  endereco2 = {
    cep: '',
    rua: '',
    nro: '',
    comp: '',
    bairro: '',
    cidade: '',
    estado: ''
  };
  today = new Date();
  // bread crumb items
  breadCrumbItems!: Array<{}>;

  dependent: boolean = false

  track = (_: number, item: Condicao) => item;
  listagem: Grupo[] = [];
  construtorFilter: string = '';
  empreendimentoFilter: string = ''
  unidadeFilter: string = ''
  hideConstrutoraSelector = false;
  hideEmpreendimentoSelector = false;
  private unidadeIdInicial: number | null = null;
  private unidadeInicialAplicada = false;
  invoices: any;
  submitted = false;
  InvoicesForm!: UntypedFormGroup;
  paymentSign = "$";
  subtotal = 0;
  taxRate = 0.18;
  shippingRate = 65.0;
  discountRate = 0.30;
  proposta: PropostaReserva = {
    id: 0, empreendimentoID: '', unidadeID: '',
    engCaixa: false, vlrUnidade: 0,
    clienteName: '', dateNascimento: '', cnpjCpf: '', rg: '', emailCliente: '',
    phoneOne: '', phoneTwo: '', estadoCivil: '', profissao: '', renda: '',
    clienteNameSecondary: '', dataNascimentoSecondary: '', cnpjCPFSecondary: '',
    rgSecondary: '', emailClienteSecondary: '', phoneOneSecondary: '',
    phoneTwoSecondary: '', estadoCivilSecondary: '', profissaoSecondary: '',
    rendaSecondary: '',
    cep: '', rua: '', nro: '', comp: '', bairro: '', cidade: '', estado: '',
    corretorID: '', corretorNome: '', gerenteID: '', gerenteNome: '', coordenadorID: '', coordenadorNome: '',
    status: 'RASCUNHO', createdAt: '',
    condicao: []
  };


  userForm!: UntypedFormGroup;
  forms: any = []; // Array to store form indices

  // -----------------------------
  visuDispo: boolean = true;

  apartamentos: Apartamento[] = [];
  loadingProposta = false;
  savingProposal = false;
  editando = false;
  gerandoPdf = false;
  gerentes: Usuarios[] = [];
  vendedoresFiltrados: Usuarios[] = [];
  coordenadoresFiltrados: Usuarios[] = [];
  usuarioLogado: AuthUserInfo | null = null;

  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;


  constructor(private route: ActivatedRoute, private formBuilder: UntypedFormBuilder, public router: Router, private service: ApiService, private proposalsService: ProposalsService, private authService: AuthenticationService, public toast: ToastrService) {
    this.userForm = this.formBuilder.group({
      productName: ['', [Validators.required]],
      rate: ['', [Validators.required]],
      quantity: [0],
      price: []
    })
  }


  ngOnInit() {
    this.carregarDadosEquipe();

    const construtoraIdParam = this.route.snapshot.queryParamMap.get('construtoraId');
    const empreendimentoIdParam = this.route.snapshot.queryParamMap.get('empreendimentoId');
    const unidadeIdParam = this.route.snapshot.queryParamMap.get('unidadeId');
    const construtoraId = Number(construtoraIdParam);
    const empreendimentoId = Number(empreendimentoIdParam);
    const unidadeId = Number(unidadeIdParam);
    const construtoraValida = Number.isFinite(construtoraId) && construtoraId > 0;
    const empreendimentoValido = Number.isFinite(empreendimentoId) && empreendimentoId > 0;
    this.unidadeIdInicial = Number.isFinite(unidadeId) && unidadeId > 0 ? unidadeId : null;

    this.hideConstrutoraSelector = construtoraValida || empreendimentoValido;
    this.hideEmpreendimentoSelector = false;

    const carregarEmpreendimentosDaConstrutora = (constructorId: number) => {
      if (!(Number.isFinite(constructorId) && constructorId > 0)) {
        this.hideConstrutoraSelector = false;
        this.empreendimentos = [];
        return;
      }

      this.construtorFilter = String(constructorId);
      this.service.getEmpreendimentosBYConstrutor(this.construtorFilter).subscribe((empreendimentos) => {
        const listaFiltrada = empreendimentos ?? [];

        if (listaFiltrada.length > 0) {
          this.empreendimentos = listaFiltrada;

          if (empreendimentoValido && this.empreendimentos.some(item => Number(item.id) === empreendimentoId)) {
            this.empreendimentoFilter = String(empreendimentoId);
          } else if (empreendimentoValido) {
            this.empreendimentoFilter = '';
          }
          return;
        }

        this.service.getEmpreendimentos().subscribe((todosEmpreendimentos) => {
          this.empreendimentos = (todosEmpreendimentos ?? []).filter(item => Number(item.constructorId) === constructorId);

          if (empreendimentoValido && this.empreendimentos.some(item => Number(item.id) === empreendimentoId)) {
            this.empreendimentoFilter = String(empreendimentoId);
          } else if (empreendimentoValido) {
            this.empreendimentoFilter = '';
          }
        });
      });
    };

    if (empreendimentoValido) {
      this.service.getEmpreendimentosById(empreendimentoId).subscribe({
        next: (empreendimento) => {
          const constructorId = Number(empreendimento?.constructorId);
          carregarEmpreendimentosDaConstrutora(constructorId);
        },
        error: () => {
          this.hideConstrutoraSelector = false;
          this.empreendimentos = [];
          this.empreendimentoFilter = '';
        }
      });
    } else if (construtoraValida) {
      carregarEmpreendimentosDaConstrutora(construtoraId);
    } else {
      this.hideConstrutoraSelector = false;
    }

    this.service.getConstrutora().subscribe((data) => {
      this.construtora = data;
    });

    if (this.modo === 'criacao') {
      this.service.getFiliais().subscribe((data) => {
        this.filiais = data;
      });
    }

  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propostaId'] && this.modo === 'visualizacao' && this.propostaId) {
      this.carregarProposta(this.propostaId);
    }
  }

  private carregarDadosEquipe(): void {
    this.authService.getUser().subscribe({
      next: (user) => {
        this.usuarioLogado = user;

        if (this.authService.isGerente(user)) {
          const gerenteId = Number(user.gerenteId ?? user.id ?? 0);
          this.gerentes = gerenteId > 0
            ? [{ id: gerenteId, name: user.nome, email: user.email ?? '', emailVerifiedAt: '', password: '', rememberToken: '', hidden: false, createdAt: '', updatedAt: '', cpf: '', address: '', cellphone: '', admissionDate: '', token: '', jobpositionId: 3, filial: 0, enterpriseVisibility: false, empregado: false, managerId: user.managerId ?? undefined, coordenatorId: user.coordenatorId ?? undefined, gestorId: user.gestorId ?? undefined }]
            : [];

          this.proposta.gerenteID = gerenteId > 0 ? gerenteId : '';
          this.proposta.gerenteNome = user.nome;

          if (gerenteId > 0) {
            this.carregarEquipeDoGerente(gerenteId, true);
          }
          return;
        }

        this.service.getGerentes().subscribe({
          next: (gerentes) => {
            this.gerentes = gerentes ?? [];
            this.sincronizarEquipeComProposta();
          },
          error: () => {
            this.gerentes = [];
          }
        });
      },
      error: () => {
        this.usuarioLogado = this.authService.getUserSnapshot();
      }
    });
  }

  private sincronizarEquipeComProposta(): void {
    const gerenteId = Number(this.proposta.gerenteID);
    if (gerenteId > 0) {
      this.carregarEquipeDoGerente(gerenteId, true);
    }
  }

  private carregarEquipeDoGerente(gerenteId: number, preservarSelecao: boolean): void {
    if (!gerenteId) {
      this.vendedoresFiltrados = [];
      this.coordenadoresFiltrados = [];
      if (!preservarSelecao) {
        this.proposta.corretorID = '';
        this.proposta.corretorNome = '';
        this.proposta.coordenadorID = '';
        this.proposta.coordenadorNome = '';
      }
      return;
    }

    forkJoin({
      vendedores: this.service.getVendedoresPorGerente(gerenteId),
      coordenadores: this.service.getCoordenadoresPorGerente(gerenteId)
    }).subscribe({
      next: ({ vendedores, coordenadores }) => {
        this.vendedoresFiltrados = vendedores ?? [];
        this.coordenadoresFiltrados = coordenadores ?? [];

        if (!preservarSelecao && !this.vendedoresFiltrados.some(v => Number(v.id) === Number(this.proposta.corretorID))) {
          this.proposta.corretorID = '';
          this.proposta.corretorNome = '';
        }

        if (!preservarSelecao && !this.coordenadoresFiltrados.some(c => Number(c.id) === Number(this.proposta.coordenadorID))) {
          this.proposta.coordenadorID = '';
          this.proposta.coordenadorNome = '';
        }

        this.sincronizarNomesEquipe();
      },
      error: () => {
        this.vendedoresFiltrados = [];
        this.coordenadoresFiltrados = [];
      }
    });
  }

  onGerenteChange(): void {
    const gerenteId = Number(this.proposta.gerenteID);
    const gerente = this.gerentes.find(g => Number(g.id) === gerenteId);
    this.proposta.gerenteNome = gerente?.name ?? '';
    this.proposta.corretorID = '';
    this.proposta.corretorNome = '';
    this.proposta.coordenadorID = '';
    this.proposta.coordenadorNome = '';
    this.carregarEquipeDoGerente(gerenteId, false);
  }

  onCorretorChange(): void {
    const corretor = this.vendedoresFiltrados.find(v => Number(v.id) === Number(this.proposta.corretorID));
    this.proposta.corretorNome = corretor?.name ?? '';
  }

  onCoordenadorChange(): void {
    const coordenador = this.coordenadoresFiltrados.find(c => Number(c.id) === Number(this.proposta.coordenadorID));
    this.proposta.coordenadorNome = coordenador?.name ?? '';
  }

  private sincronizarNomesEquipe(): void {
    const gerente = this.gerentes.find(g => Number(g.id) === Number(this.proposta.gerenteID));
    if (gerente) {
      this.proposta.gerenteNome = gerente.name;
    }

    this.onCorretorChange();
    this.onCoordenadorChange();
  }

  gerenteDropdownDesabilitado(): boolean {
    if (this.modo === 'visualizacao' && !this.editando) {
      return true;
    }

    return this.authService.isGerente(this.usuarioLogado);
  }

  equipeDropdownDesabilitada(): boolean {
    return this.modo === 'visualizacao' && !this.editando;
  }

  groupUnits() {
    const byBloco = new Map<string, Map<number, Apartamento[]>>();

    for (const ap of this.apartamentos) {
      const bloco = ap.bloco || '(Sem identificação)';
      const andar = Number(ap.andar);

      if (!byBloco.has(bloco)) byBloco.set(bloco, new Map());
      const mapAndar = byBloco.get(bloco)!;

      if (!mapAndar.has(andar)) mapAndar.set(andar, []);
      mapAndar.get(andar)!.push(ap);
    }

    // transforma em array e ordena: bloco AZ, andar 1N, número crescente
    this.listagem = Array.from(byBloco.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bloco, floors]) => ({
        bloco,
        andares: Array.from(floors.entries())
          .sort(([a], [b]) => a - b)
          .map(([andar, unidades]) => ({
            andar,
            unidades: unidades.sort((x, y) => this.compNumero(x.numero, y.numero))
          }))
      }));
  }

  private compNumero(a: string, b: string) {
    // ordena "101", "205", "12B" corretamente
    return a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' });
  }

  changeEmpreendimento() {
    this.carregarUnidadesDoEmpreendimento(this.empreendimentoFilter);
  }

  private carregarUnidadesDoEmpreendimento(empreendimentoId: string | number) {
    const empreendimentoSelecionado = String(empreendimentoId ?? '');

    this.empreendimentoFilter = empreendimentoSelecionado;
    this.apartamentos = []
    this.grupos = []
    this.unidadeFilter = ''
    this.unidadeSelecionada = ''
    this.proposta.unidadeID = ''
    this.proposta.vlrUnidade = 0

    if (!empreendimentoSelecionado || empreendimentoSelecionado === '0') {
      this.proposta.empreendimentoID = '';
      return;
    }

    this.service.getApartamentEspelho(empreendimentoSelecionado).subscribe((data) => {
      this.apartamentos = data ?? []
      this.proposta.empreendimentoID = empreendimentoSelecionado
      this.grupos = this.groupByBlocoAndAndar(this.apartamentos);
      this.aplicarUnidadeInicial();
    })
  }

  private aplicarUnidadeInicial(): void {
    if (this.unidadeInicialAplicada || !this.unidadeIdInicial) {
      return;
    }

    const unidade = this.apartamentos.find((item) => Number(item.id) === this.unidadeIdInicial);
    if (!unidade) {
      return;
    }

    this.unidadeInicialAplicada = true;
    this.unidadeFilter = String(unidade.id);
    this.setUnit(unidade.id, unidade.valor, String(unidade.numero));
    setTimeout(() => this.modalReserva?.show());
  }

  changeEnterprise() {
    this.service.getEmpreendimentosBYConstrutor(this.construtorFilter).subscribe((data) => {
      this.empreendimentos = data
    })

    this.apartamentos = []
    this.grupos = []
    this.empreendimentoFilter = ''
    this.unidadeFilter = ''
  }

  onUnidadeChange() {
    const unidadeId = Number(this.unidadeFilter);
    const unidadeSelecionada = this.apartamentos.find((item) => Number(item.id) === unidadeId);

    if (!unidadeSelecionada) {
      return;
    }

    this.proposta.unidadeID = unidadeSelecionada.id.toString();
    this.proposta.vlrUnidade = unidadeSelecionada.valor;
    this.unidadeSelecionada = String(unidadeSelecionada.numero);
    this.resetarEstadoSegundoProponente();
    this.modalReserva.show();
  }
  salvar() {
    if (!this.proposta.clienteName || !this.proposta.cnpjCpf) {
      alert('Preencha Nome e CPF do 1º comprador!');
      return;
    }
    console.log(this.proposta);
  }

  cep() {

    var cep = this.proposta.cep.replace('-', '')

    this.service.getVIACEP(cep).subscribe((data) => {
      this.proposta.rua = data.logradouro
      this.proposta.bairro = data.bairro
      this.proposta.cidade = data.localidade
      this.proposta.estado = data.uf
      this.copiarEndereco();
    })

  }

  copiarEndereco() {
    if (this.mesmoEndereco) {
      this.endereco2 = {
        cep: this.proposta.cep || '',
        rua: this.proposta.rua || '',
        nro: this.proposta.nro || '',
        comp: this.proposta.comp || '',
        bairro: this.proposta.bairro || '',
        cidade: this.proposta.cidade || '',
        estado: this.proposta.estado || ''
      };
    }
  }

  buscarCep2() {
    const cep = (this.endereco2.cep || '').replace(/\D/g, '');
    if (!cep) return;

    this.service.getVIACEP(cep).subscribe((data) => {
      this.endereco2.rua = data.logradouro;
      this.endereco2.bairro = data.bairro;
      this.endereco2.cidade = data.localidade;
      this.endereco2.estado = data.uf;
    });
  }

  resetarEstadoSegundoProponente() {
    this.mostrarSegundoProponente = false;
    this.mesmoEndereco = true;
    this.copiarEndereco();
  }

  handleModalHidden() {
    this.editando = false;
    this.resetarEstadoSegundoProponente();
    if (this.modo === 'visualizacao') {
      this.fechado.emit();
    }
  }

  fecharModalReserva() {
    this.resetarEstadoSegundoProponente();
    this.modalReserva.hide();
  }
  atualizarRenda(event: Event, campo: 'renda' | 'rendaSecondary' = 'renda') {
    const input = event.target as HTMLInputElement;
    const valor = input.value ?? '';
    const numeros = valor.replace(/\D/g, '');
    const valorNumerico = parseFloat(numeros) / 100;

    if (!isNaN(valorNumerico)) {
      if (campo === 'renda') {
        this.proposta.renda = valorNumerico.toString();
      } else {
        this.proposta.rendaSecondary = valorNumerico.toString();
      }
    } else {
      if (campo === 'renda') {
        this.proposta.renda = '';
      } else {
        this.proposta.rendaSecondary = '';
      }
    }
  }

  reservaById(ap: Apartamento) {
    console.log('Selecionado:', ap);
  }

  checkStatusReservado(ap: Apartamento): boolean {
    return ap.status.toLowerCase() === 'reservado';
  }

  checkStatus(status: string, group?: any, seller?: any): boolean {
    return false; // Simulação
  }

  visu: boolean = true

  openModalClient(status: string) {
    if (status === 'Disponivel') {
      this.meuModal.show(false);
    }

    if (status === 'Vendido') {
      this.meuModal.show(true);
    }
  }

  formatAndar(andar: any) {
    return andar === 1 ? 'Térreo' : andar - 1;
  }

  camposDesabilitados(): boolean {
    return this.modo === 'visualizacao' && !this.editando;
  }

  iniciarEdicao(): void {
    if (this.modo !== 'visualizacao') return;
    this.editando = true;
  }

  cancelarEdicao(): void {
    if (this.modo !== 'visualizacao' || !this.proposta?.id) {
      this.editando = false;
      return;
    }

    this.editando = false;
    this.carregarProposta(this.proposta.id);
  }
  canEnviarParaAnalise(): boolean {
    return this.normalizeStatus(this.proposta?.status) === 'RASCUNHO';
  }

  canApprove(): boolean {
    return this.normalizeStatus(this.proposta?.status) === 'EM_ANALISE';
  }

  canReprovar(): boolean {
    return this.normalizeStatus(this.proposta?.status) === 'EM_ANALISE';
  }

  carregarProposta(id: number): void {
    this.loadingProposta = true;
    this.proposalsService.getById(id).subscribe({
      next: (p) => {
        p.condicao?.forEach(c => {
          c.vencimento = moment(c.vencimento).format('YYYY-MM-DD');
        });

        this.proposta = {
          ...p,
          status: this.normalizeStatus(p.status)
        };

        this.proposta.dateNascimento = this.proposta.dateNascimento
          ? moment(this.proposta.dateNascimento).format('YYYY-MM-DD')
          : '';
        this.proposta.dataNascimentoSecondary = this.proposta.dataNascimentoSecondary
          ? moment(this.proposta.dataNascimentoSecondary).format('YYYY-MM-DD')
          : '';

        this.unidadeSelecionada = this.proposta.unitName || '';
        this.mostrarSegundoProponente = !!(
          this.proposta.clienteNameSecondary ||
          this.proposta.cnpjCPFSecondary ||
          this.proposta.emailClienteSecondary ||
          this.proposta.phoneOneSecondary
        );
        this.editando = false;
        this.sincronizarEquipeComProposta();

        if (this.modo === 'visualizacao') {
          setTimeout(() => this.modalReserva?.show(), 0);
        }
      },
      error: (erro: any) => {
        console.error(erro);
        this.toast.error(erro?.error?.message || 'Erro ao carregar proposta');
      },
      complete: () => {
        this.loadingProposta = false;
      }
    });
  }

  enviarParaAnalise(): void {
    if (!this.proposta?.id || !this.canEnviarParaAnalise()) return;

    this.savingProposal = true;
    this.proposalsService.enviarParaAnalise(this.proposta.id).subscribe({
      next: () => {
        this.proposta.status = 'EM_ANALISE';
        this.toast.success('Proposta enviada para análise');
        this.propostaAtualizada.emit();
      },
      error: (erro: any) => {
        console.error(erro);
        this.toast.error(erro?.error?.message || 'Erro ao enviar proposta');
      },
      complete: () => {
        this.savingProposal = false;
      }
    });
  }

  approveSelected(): void {
    if (!this.proposta?.id || !this.canApprove()) return;

    this.savingProposal = true;
    this.proposalsService.approve(this.proposta.id).subscribe({
      next: () => {
        this.proposta.status = 'APROVADO';
        this.toast.success('Proposta aprovada');
        this.propostaAtualizada.emit();
      },
      error: (erro: any) => {
        console.error(erro);
        this.toast.error(erro?.error?.message || 'Erro ao aprovar proposta');
      },
      complete: () => {
        this.savingProposal = false;
      }
    });
  }

  reprovarProposta(): void {
    if (!this.proposta?.id || !this.canReprovar()) return;

    this.savingProposal = true;
    this.proposalsService.reprovar(this.proposta.id).subscribe({
      next: () => {
        this.proposta.status = 'REPROVADO';
        this.toast.success('Proposta reprovada');
        this.propostaAtualizada.emit();
      },
      error: (erro: any) => {
        console.error(erro);
        this.toast.error(erro?.error?.message || 'Erro ao reprovar proposta');
      },
      complete: () => {
        this.savingProposal = false;
      }
    });
  }

  private normalizeStatus(status?: string | null): 'RASCUNHO' | 'EM_ANALISE' | 'APROVADO' | 'REPROVADO' {
    const normalized = (status || '').trim().toUpperCase();

    switch (normalized) {
      case 'OPEN':
      case 'RESERVED':
      case 'RASCUNHO':
        return 'RASCUNHO';
      case 'IN_ANALYSIS':
      case 'IN_ANALISE':
      case 'EM_ANALISE':
        return 'EM_ANALISE';
      case 'APPROVED':
      case 'APROVADO':
        return 'APROVADO';
      case 'REJECTED':
      case 'REPROVADO':
        return 'REPROVADO';
      default:
        return 'RASCUNHO';
    }
  }

  saveUser() {
    if (this.modo === 'visualizacao' && !this.editando) {
      return;
    }

    this.sincronizarNomesEquipe();

    if (!this.isPropostaValida()) {
      this.toast.warning('Preencha todos os campos obrigatórios da proposta.');
      return;
    }

    this.savingProposal = true;
    this.proposta.status = this.normalizeStatus(this.proposta.status);

    const request$ = this.modo === 'visualizacao' && this.proposta.id
      ? this.proposalsService.update(this.proposta.id, this.proposta)
      : this.proposalsService.create({ ...this.proposta, status: 'RASCUNHO' });

    request$.subscribe({
      next: () => {
        if (this.modo === 'visualizacao' && this.proposta.id) {
          this.editando = false;
          this.toast.success('Proposta atualizada com sucesso!');
          this.propostaAtualizada.emit();
        } else {
          this.toast.success('Proposta criada com sucesso! Salva como rascunho.');
          this.fecharModalReserva();
        }
      },
      error: (erro: any) => {
        console.error(erro);
        this.toast.error(erro?.error?.message || ('Erro ao salvar proposta: ' + erro.message));
      },
      complete: () => {
        this.savingProposal = false;
      }
    });
  }

  isPropostaValida(): boolean {

    // 1º proponente
    if (!this.proposta.clienteName) return false;
    if (!this.proposta.cnpjCpf) return false;
    if (!this.proposta.phoneOne) return false;
    if (!this.proposta.emailCliente) return false;

    // Empreendimento e Unidade (NOVO)
    if (!this.proposta.empreendimentoID) return false;
    if (!this.proposta.unidadeID) return false;
    if (!this.proposta.vlrUnidade || this.proposta.vlrUnidade <= 0) return false;

    // Endereço
    if (!this.proposta.cep) return false;
    if (!this.proposta.rua) return false;
    if (!this.proposta.nro) return false;
    if (!this.proposta.bairro) return false;
    if (!this.proposta.cidade) return false;
    if (!this.proposta.estado) return false;

    // Engenharia Caixa
    if (this.proposta.engCaixa === null || this.proposta.engCaixa === undefined) return false;

    // Condições
    if (!this.proposta.condicao || this.proposta.condicao.length === 0) return false;

    if (!this.proposta.gerenteID) return false;
    if (!this.proposta.corretorID) return false;
    if (!this.proposta.coordenadorID) return false;

    // 2º proponente (se estiver visível) - NOVO
    if (this.mostrarSegundoProponente) {
      if (!this.proposta.clienteNameSecondary) return false;
      if (!this.proposta.cnpjCPFSecondary) return false;
    }

    return true;
  }



  padronizarColunas(torre: any) {
    const max = Math.max(
      ...torre.andares.map((a: any) => a.apartamentos.length)
    );
    torre.andares.forEach((andar: any) => {
      while (andar.apartamentos.length < max) {
        andar.apartamentos.push(undefined);
      }
    });
    return torre;
  }

  setUnit(id: number, amount: number, descricaoUnidade: string) {
    this.proposta.unidadeID = id.toString()
    this.proposta.vlrUnidade = amount
    this.unidadeSelecionada = descricaoUnidade
    this.resetarEstadoSegundoProponente()
    this.modalReserva.hide()
  }

  baixarPDF() {
    const element = this.pdfContent.nativeElement;
    element.style.display = 'block';


    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('mapa-de-apartamentos.pdf');

      element.style.display = 'none'
    });
  }

  adicionar(): void {
    this.proposta.condicao.push({
      qtde: 1,
      descricao: '',
      vencimento: moment().format(),
      valorParcela: 0,
      valorTotal: 0
    });
  }

  sugerirVencimento(c: Condicao, i: number): void {
    if (c?.descricao !== 'Mensal') {
      return;
    }

    c.vencimento = this.proximoVencimentoMensal();
    this.recalc(i);
  }

  validarVencimento(c: Condicao, i: number): void {
    if (!c || c.descricao !== 'Mensal' || !c.vencimento) {
      return;
    }

    const data = moment(c.vencimento, 'YYYY-MM-DD', true);
    const dia = data.date();

    if (!data.isValid() || ![10, 20, 30].includes(dia)) {
      this.toast.warning('Para parcelas mensais, o vencimento deve ser dia 10, 20 ou 30.');
      c.vencimento = this.proximoVencimentoMensal();
      this.recalc(i);
    }
  }

  private proximoVencimentoMensal(): string {
    const hoje = moment();
    const proximoMes = hoje.clone().add(1, 'month').startOf('month');

    let diaSugerido = 30;

    if (hoje.date() <= 10) {
      diaSugerido = 10;
    } else if (hoje.date() <= 20) {
      diaSugerido = 20;
    }

    const diasPermitidos = [10, 20, 30].filter(dia => dia <= proximoMes.daysInMonth());
    const diaFinal = diasPermitidos.includes(diaSugerido)
      ? diaSugerido
      : diasPermitidos[diasPermitidos.length - 1];

    return proximoMes.clone().date(diaFinal).format('YYYY-MM-DD');
  }
  vlrTotal() {
    return this.proposta.condicao.reduce((acc, c) => acc + (Number(c?.valorTotal) || 0), 0);
  }

  remover(i: number): void {
    this.proposta.condicao.splice(i, 1);
  }

  recalc(i: number): void {
    const c = this.proposta.condicao[i];
    const q = this.toNumber(c.qtde);
    const v = this.toNumber(c.valorParcela);
    c.valorTotal = this.round2(q * v);
  }

  private toNumber(v: any): number {
    if (v === null || v === undefined || v === '') return 0;
    // aceita "1,23" e "1.23"
    return Number(String(v).replace(/\./g, '').replace(',', '.')) || Number(v) || 0;
  }

  private round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  downloadPropostaPDF() {
    const element = this.areaA4Ref?.nativeElement as HTMLElement;

    if (!element) {
      this.toast.error('Não foi possível localizar a área do PDF.');
      return;
    }

    // garante fundo branco no PDF (evita transparência)
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#ffffff';
    this.gerandoPdf = true;

    // espera 1 tick para garantir que o modal terminou de renderizar
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

        // dimensões da imagem no PDF mantendo proporção
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // primeira página
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        const nome = `proposta_${this.proposta?.id || 'novo'}.pdf`;
        pdf.save(nome);

      } catch (e) {
        console.error(e);
        this.toast.error('Erro ao gerar PDF da proposta.');
      } finally {
        this.gerandoPdf = false;
        element.style.backgroundColor = originalBg;
      }
    }, 100);
  }


  // Se precisar enviar ao backend:
  getPayload() {
    // mapeie como a API espera; aqui vai tudo já com valorTotal calculado
    return this.proposta.condicao.map(c => ({
      qtde: c.qtde,
      descricao: c.descricao,
      vencimento: c.vencimento,
      valorParcela: c.valorParcela,
      valorTotal: c.valorTotal
    }));
  }

  private toNum(v: any): number {
    return typeof v === 'number' ? v : parseInt(String(v).replace(/[^\d-]/g, ''), 10) || 0;
  }

  private groupByBlocoAndAndar(items: Apartamento[]): GrupoBloco[] {
    const blocos = new Map<string, Map<number, Apartamento[]>>();

    for (const u of items) {
      const bloco = u.bloco?.toString().trim() || '';
      const andar = this.toNum(u.andar);
      const numero = this.toNum(u.numero);
      // normaliza para ordenar a vitrine
      const norm: Apartamento = { ...u, andar, numero, mt2: this.toNum(u.mt2) };

      if (!blocos.has(bloco)) blocos.set(bloco, new Map());
      const byAndar = blocos.get(bloco)!;
      if (!byAndar.has(andar)) byAndar.set(andar, []);
      byAndar.get(andar)!.push(norm);
    }

    // monta estrutura ordenada
    const saida: GrupoBloco[] = [];
    for (const [bloco, byAndar] of blocos) {
      const andares: GrupoAndar[] = [];
      for (const [andar, unidades] of byAndar) {
        unidades.sort((a, b) => this.toNum(a.numero) - this.toNum(b.numero));
        andares.push({ andar, unidades });
      }
      // Ex.: do maior andar para o menor
      andares.sort((a, b) => a.andar - b.andar);
      saida.push({ bloco, andares });
    }
    // opcional: ordenar Bloco 1, Bloco 2, ...
    saida.sort((a, b) => this.toNum(a.bloco) - this.toNum(b.bloco));
    return saida;
  }

  statusClass(s?: string) {
    const x = (s || '').toUpperCase();
    return {
      disp: x === 'AVAILABLE' || x === 'OPEN' || x === 'DISPONIVEL' || x === 'DISPONÍVEL',
      res: x === 'RESERVED' || x === 'RESERVADO',
      vend: x === 'SELL' || x === 'SOLD' || x === 'VENDIDO'
    };
  }

  trackBloco(_: number, b: GrupoBloco) { return b.bloco; }
  trackAndar(_: number, a: GrupoAndar) { return a.andar; }
  trackUnidade(_: number, u: Apartamento) { return u.id ?? `${u.bloco}-${u.andar}-${u.numero}`; }

  print(elementId: string) {
    const conteudo = document.getElementById(elementId);
    if (!conteudo) return;

    const janela = window.open('', '_blank', 'noopener,noreferrer,width=800,height=600');
    if (!janela) return;

    // Copie estilos globais básicos + suas classes de impressão
    const css = `
    <style>
      @page { size: A4 portrait; margin: 12mm; }
      @media print {
        html, body { height: 297mm; width: 210mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-break { page-break-inside: avoid; break-inside: avoid; }
        .page-break { page-break-after: always; break-after: page; }
        .print-area { max-width: 186mm; margin: 0 auto; }
      }
      /* opcional: estilos do seu app que queira preservar */
      body { font-family: Arial, Helvetica, sans-serif; font-size: 12pt; }
      h1,h2,h3{ margin: 0 0 8px; }
    </style>
  `;

    janela.document.open();
    janela.document.write(`
    <html>
      <head>
        <meta charset="utf-8">
        <title>Impressão</title>
        ${css}
      </head>
      <body onload="window.focus(); window.print(); window.close();">
        <div class="print-area">
          ${conteudo.innerHTML}
        </div>
      </body>
    </html>
  `);
    janela.document.close();
  }

}





































