import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/core/services/api.service';
import { ProposalsService } from 'src/app/core/services/proposals.service';
import { PropostaReserva } from 'src/app/models/proposta-reserva';
import { Condicao } from '../empreendimentos/espelho/espelho.component';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Apartamento } from 'src/app/core/data/empreendimento';
import { Construtoras, Empreendimento } from 'src/app/models/ContaBancaria';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export type PropostaStatus = 'RASCUNHO' | 'EM_ANALISE' | 'APROVADO' | 'REPROVADO';

export interface FichaPropostaInicial {
  unidadeId: number;
  unidadeNumero?: string;
  empreendimentoId?: number;
  valor?: number;
}

interface Usuario {
  id: number;
  name?: string;
  nome?: string;
  gerenteId?: number;
  managerId?: number;
  gestorId?: number;
  coordenadorId?: number;
  coordenatorId?: number;
  email?: string;
}

@Component({
  selector: 'app-propostas',
  templateUrl: './propostas.component.html',
  styleUrls: ['./propostas.component.scss']
})
export class PropostasComponent implements OnInit, OnChanges {
  @Input() fichaInicial?: FichaPropostaInicial | null;
  @Input() somenteModal = false;
  @Output() fichaFechada = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  items: PropostaReserva[] = [];
  pagedItems: PropostaReserva[] = [];
  totalItems = 0;
  page = 1;
  itemsPerPage = 50;
  perPageOptions = [50, 100, 150];

  @ViewChild('detailTpl', { static: false }) modalReserva!: ModalDirective;
  @ViewChild('areaA4Ref', { static: false }) areaA4Ref!: ElementRef<HTMLElement>;

  modalRef?: BsModalRef;
  proposta: PropostaReserva = this.criarPropostaVazia();
  selectedProposalId?: number;
  approving = false;
  construtoras: Construtoras[] = [];
  empreendimentos: Empreendimento[] = [];
  gerentes: Usuario[] = [];
  corretores: Usuario[] = [];
  coordenadores: Usuario[] = [];
  vendedores: Usuario[] = [];
  todosCoordenadores: Usuario[] = [];
  todosVendedores: Usuario[] = [];
  construtorFilter = '';
  apartamentos: Apartamento[] = [];
  today = new Date();
  voltarAoEspelho = false;
  assinatura1: string | null = null;
  assinatura2: string | null = null;
  mostrarSegundoProponente = false;
  mesmoEndereco = true;
  endereco2 = {
    cep: '',
    rua: '',
    nro: '',
    comp: '',
    bairro: '',
    cidade: '',
    estado: ''
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService,
    private svc: ApiService,
    private proposalsService: ProposalsService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      de: [''],
      ate: [''],
      status: ['EM_ANALISE'],
      gerente: [''],
      coordenador: [''],
      corretor: [''],
      construtora: [''],
      empreendimento: ['']
    });

    if (!this.somenteModal) {
      this.buscar();
      this.abrirFichaPorQueryParams();
    }

    this.carregarEquipe();
    this.carregarConstrutorasFiltro();
    this.carregarEmpreendimentosFiltro();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fichaInicial'] && this.fichaInicial) {
      this.abrirFichaInicial(this.fichaInicial);
    }
  }

  private abrirFichaPorQueryParams(): void {
    const unidadeId = Number(this.route.snapshot.queryParamMap.get('unidadeId'));
    const unidadeNumero = this.route.snapshot.queryParamMap.get('unidadeNumero');
    const empreendimentoId = Number(this.route.snapshot.queryParamMap.get('empreendimentoId'));
    const valor = Number(this.route.snapshot.queryParamMap.get('valor'));
    this.voltarAoEspelho = this.route.snapshot.queryParamMap.get('origem') === 'espelho';

    if (!Number.isFinite(unidadeId) || unidadeId <= 0) {
      return;
    }

    this.proposta = {
      ...this.proposta,
      unidadeID: String(unidadeId),
      unitName: unidadeNumero || String(unidadeId),
      empreendimentoID: Number.isFinite(empreendimentoId) && empreendimentoId > 0 ? String(empreendimentoId) : '',
      vlrUnidade: Number.isFinite(valor) ? valor : 0,
      status: 'RASCUNHO',
      condicao: this.proposta?.condicao ?? []
    } as PropostaReserva;
    this.resetarSegundoProponente();

    setTimeout(() => this.modalReserva?.show());
  }

  private abrirFichaInicial(ficha: FichaPropostaInicial): void {
    this.proposta = {
      ...this.criarPropostaVazia(),
      unidadeID: String(ficha.unidadeId),
      unitName: ficha.unidadeNumero || String(ficha.unidadeId),
      empreendimentoID: ficha.empreendimentoId ? String(ficha.empreendimentoId) : '',
      vlrUnidade: ficha.valor ?? 0,
      status: 'RASCUNHO',
      condicao: []
    };
    this.resetarSegundoProponente();

    setTimeout(() => this.modalReserva?.show());
  }

  private carregarEquipe(): void {
    this.carregarGerentes();
    this.carregarTodosCoordenadores();
    this.carregarTodosVendedores();
  }

  carregarConstrutorasFiltro(): void {
    this.svc.getConstrutora().subscribe({
      next: (data) => this.construtoras = data ?? [],
      error: () => this.construtoras = []
    });
  }

  carregarEmpreendimentosFiltro(): void {
    const construtoraId = this.form?.get('construtora')?.value;

    if (construtoraId) {
      this.svc.getEmpreendimentosBYConstrutor(construtoraId).subscribe({
        next: (data) => this.empreendimentos = data ?? [],
        error: () => this.empreendimentos = []
      });
      return;
    }

    this.svc.getEmpreendimentos().subscribe({
      next: (data) => this.empreendimentos = data ?? [],
      error: () => this.empreendimentos = []
    });
  }

  onConstrutoraFiltroChange(): void {
    this.form.patchValue({ empreendimento: '' });
    this.carregarEmpreendimentosFiltro();
  }

  carregarGerentes(): void {
    this.svc.getGerentes().subscribe({
      next: (data) => this.gerentes = data ?? [],
      error: () => this.gerentes = []
    });
  }

  carregarTodosCoordenadores(): void {
    this.svc.getCoordenadores().subscribe({
      next: (data) => {
        this.todosCoordenadores = data ?? [];
        this.aplicarFiltroCoordenadores(false);
      },
      error: () => {
        this.todosCoordenadores = [];
        this.coordenadores = [];
      }
    });
  }

  carregarTodosVendedores(): void {
    this.svc.getCorretores().subscribe({
      next: (data) => {
        this.todosVendedores = data ?? [];
        this.corretores = data ?? [];
        this.aplicarFiltroVendedores(false);
      },
      error: () => {
        this.todosVendedores = [];
        this.corretores = [];
        this.vendedores = [];
      }
    });
  }

  onGerenteChange(): void {
    const gerente = this.gerentes.find(g => Number(g.id) === Number(this.proposta.gerenteID));
    this.proposta.gerenteNome = this.nomeUsuario(gerente);
    this.proposta.coordenadorID = '';
    this.proposta.coordenadorNome = '';
    this.proposta.corretorID = '';
    this.proposta.corretorNome = '';
    this.aplicarFiltroCoordenadores(false);
    this.vendedores = [];
  }

  onCoordenadorChange(): void {
    const coordenador = this.coordenadores.find(c => Number(c.id) === Number(this.proposta.coordenadorID));
    this.proposta.coordenadorNome = this.nomeUsuario(coordenador);
    this.proposta.corretorID = '';
    this.proposta.corretorNome = '';
    this.aplicarFiltroVendedores(false);
  }

  onCorretorChange(): void {
    const vendedor = this.vendedores.find(v => Number(v.id) === Number(this.proposta.corretorID));
    this.proposta.corretorNome = this.nomeUsuario(vendedor);
  }

  private aplicarFiltroCoordenadores(preservarSelecao: boolean): void {
    const gerenteId = Number(this.proposta.gerenteID);
    if (!gerenteId) {
      this.coordenadores = [];
      if (!preservarSelecao) {
        this.proposta.coordenadorID = '';
      }
      return;
    }

    this.coordenadores = this.todosCoordenadores.filter(c => this.usuarioGerenteId(c) === gerenteId);

    if (!preservarSelecao && !this.coordenadores.some(c => Number(c.id) === Number(this.proposta.coordenadorID))) {
      this.proposta.coordenadorID = '';
      this.proposta.coordenadorNome = '';
    }
  }

  private aplicarFiltroVendedores(preservarSelecao: boolean): void {
    const coordenadorId = Number(this.proposta.coordenadorID);
    if (!coordenadorId) {
      this.vendedores = [];
      if (!preservarSelecao) {
        this.proposta.corretorID = '';
      }
      return;
    }

    this.vendedores = this.todosVendedores.filter(v => this.usuarioCoordenadorId(v) === coordenadorId);

    if (!preservarSelecao && !this.vendedores.some(v => Number(v.id) === Number(this.proposta.corretorID))) {
      this.proposta.corretorID = '';
      this.proposta.corretorNome = '';
    }
  }

  private usuarioGerenteId(usuario: Usuario): number {
    return Number(usuario.gerenteId ?? usuario.managerId ?? usuario.gestorId ?? 0);
  }

  private usuarioCoordenadorId(usuario: Usuario): number {
    return Number(usuario.coordenadorId ?? usuario.coordenatorId ?? 0);
  }

  private nomeUsuario(usuario?: Usuario): string {
    return usuario?.name || usuario?.nome || '';
  }

  assinarProponente1(): void {
    this.toast.info('Assinatura do Proponente 1 ainda nao implementada.');
  }

  assinarProponente2(): void {
    this.toast.info('Assinatura do Proponente 2 ainda nao implementada.');
  }

  fecharFicha(): void {
    this.modalReserva?.hide();

    if (this.voltarAoEspelho) {
      this.router.navigate(['/jm/vendas']);
      return;
    }

    this.fichaFechada.emit();
  }

  private criarPropostaVazia(): PropostaReserva {
    return {
      id: 0,
      empreendimentoID: '',
      unidadeID: '',
      vlrUnidade: 0,
      engCaixa: false,
      clienteName: '',
      dateNascimento: '',
      cnpjCpf: '',
      rg: '',
      emailCliente: '',
      phoneOne: '',
      phoneTwo: '',
      estadoCivil: '',
      profissao: '',
      renda: '',
      clienteNameSecondary: '',
      dataNascimentoSecondary: '',
      cnpjCPFSecondary: '',
      rgSecondary: '',
      emailClienteSecondary: '',
      phoneOneSecondary: '',
      phoneTwoSecondary: '',
      estadoCivilSecondary: '',
      profissaoSecondary: '',
      rendaSecondary: '',
      createdAt: '',
      cep: '',
      rua: '',
      nro: '',
      comp: '',
      bairro: '',
      cidade: '',
      estado: '',
      corretorID: '',
      gerenteID: '',
      coordenadorID: '',
      status: 'RASCUNHO',
      condicao: []
    };
  }

  async downloadA4PrimeiraFolha() {
    const el = this.areaA4Ref?.nativeElement;

    if (!el) {
      this.toast.error('Nao foi possivel localizar a area do PDF.');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentW = pageW - margin * 2;
    const contentH = pageH - margin * 2;

    await new Promise(r => setTimeout(r, 150));

    const scale = 2;
    const pxPerMm = (el.scrollWidth * scale) / contentW;
    const captureHeightPx = Math.floor(contentH * pxPerMm);
    const finalCaptureHeight = Math.min(captureHeightPx, el.scrollHeight * scale);

    const canvas = await html2canvas(el, {
      backgroundColor: '#ffffff',
      scale,
      useCORS: true,
      allowTaint: true,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
      height: finalCaptureHeight / scale,
      y: 0
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgH = (canvas.height * contentW) / canvas.width;

    pdf.addImage(imgData, 'JPEG', margin, margin, contentW, imgH);
    pdf.save(`proposta_${this.proposta?.enterPriseName || 'novo'}_${this.proposta?.clienteName ?? 'novo'}.pdf`);
  }

  private updatePagedItems(): void {
    this.totalItems = this.items?.length || 0;
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedItems = (this.items || []).slice(start, end);
  }

  onPageChanged(event: PageChangedEvent): void {
    this.page = event.page;
    this.itemsPerPage = event.itemsPerPage;
    this.updatePagedItems();
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = Number(value);
    this.page = 1;
    this.updatePagedItems();
  }

  getStartIndex(): number {
    if (this.totalItems === 0) return 0;
    return (this.page - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.page * this.itemsPerPage, this.totalItems);
  }

  changeEnterprise() {
    this.svc.getEmpreendimentosBYConstrutor(this.construtorFilter).subscribe((data) => {
      this.empreendimentos = data;
    });

    this.apartamentos = [];
  }
  buscar() {
    this.loading = true;
    const filtros = this.cleanFilters(this.form.value);

    console.log('📊 Filtros enviados:', filtros);  // ← ADICIONE

    this.proposalsService.listarComFiltros(filtros).subscribe({
      next: res => {
        console.log('📦 Dados recebidos da API:', res);  // ← ADICIONE
        console.log('📏 Quantidade de propostas:', res?.length);  // ← ADICIONE

        this.items = (res || []).map(item => ({
          ...item,
          status: this.normalizeStatus(item.status)
        }));
        this.page = 1;
        this.updatePagedItems();
      },
      error: err => console.error('❌ Erro na requisição:', err),
      complete: () => this.loading = false
    });
  }

  private cleanFilters(filtros: any): any {
    return Object.entries(filtros || {}).reduce((acc: any, [key, value]) => {
      if (value === null || value === undefined || value === '' || value === 'ALL') {
        return acc;
      }

      acc[key] = value;
      return acc;
    }, {});
  }

  openModal(id: number) {
    this.proposalsService.getById(id).subscribe({
      next: (proposta) => {
        this.proposta = {
          ...this.criarPropostaVazia(),
          ...proposta,
          status: this.normalizeStatus(proposta.status),
          condicao: proposta.condicao ?? []
        };
        this.mostrarSegundoProponente = !!(
          this.proposta.clienteNameSecondary ||
          this.proposta.cnpjCPFSecondary ||
          this.proposta.emailClienteSecondary ||
          this.proposta.phoneOneSecondary
        );
        this.mesmoEndereco = true;
        this.copiarEndereco();
        this.aplicarFiltroCoordenadores(true);
        this.aplicarFiltroVendedores(true);
        this.modalReserva.show();
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.message || 'Erro ao carregar proposta');
      }
    });
  }

  fecharVisualizacao(): void {
    this.selectedProposalId = undefined;
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

  enviarParaAnalise(): void {
    if (!this.proposta?.id || !this.canEnviarParaAnalise()) return;

    this.approving = true;
    this.proposalsService.enviarParaAnalise(this.proposta.id).subscribe({
      next: () => {
        this.proposta.status = 'EM_ANALISE';
        this.toast.success('Proposta enviada para analise');
        this.modalReserva.hide();
        this.buscar();
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.message || 'Erro ao enviar proposta');
      },
      complete: () => this.approving = false
    });
  }

  approveSelected() {
    if (!this.proposta?.id || !this.canApprove()) return;

    this.approving = true;
    this.proposalsService.approve(this.proposta.id).subscribe({
      next: () => {
        this.proposta.status = 'APROVADO';
        this.toast.success('Proposta aprovada');
        this.modalReserva.hide();
        this.buscar();
      },
      error: err => {
        console.error(err);
        this.toast.error(err.error?.message || 'Erro ao aprovar proposta');
      },
      complete: () => this.approving = false
    });
  }

  reprovarProposta(): void {
    if (!this.proposta?.id || !this.canReprovar()) return;

    this.approving = true;
    this.proposalsService.reprovar(this.proposta.id).subscribe({
      next: () => {
        this.proposta.status = 'REPROVADO';
        this.toast.success('Proposta reprovada');
        this.modalReserva.hide();
        this.buscar();
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.message || 'Erro ao reprovar proposta');
      },
      complete: () => this.approving = false
    });
  }

  private normalizeStatus(status?: string | null): PropostaStatus {
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

  badgeClass(status: string) {
    const s = this.normalizeStatus(status);
    return {
      'bg-danger-subtle text-danger': s === 'RASCUNHO',
      'bg-warning text-dark': s === 'EM_ANALISE',
      'bg-success': s === 'APROVADO',
      'bg-danger': s === 'REPROVADO'
    };
  }

  cep() {
    const cep = (this.proposta.cep || '').replace('-', '');
    if (!cep) { return; }

    this.svc.getVIACEP(cep).subscribe((data) => {
      this.proposta.rua = data.logradouro;
      this.proposta.bairro = data.bairro;
      this.proposta.cidade = data.localidade;
      this.proposta.estado = data.estado || data.uf;
      this.copiarEndereco();
    });
  }

  copiarEndereco(): void {
    if (!this.mesmoEndereco) {
      return;
    }

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

  buscarCep2(): void {
    const cep = (this.endereco2.cep || '').replace(/\D/g, '');
    if (!cep) {
      return;
    }

    this.svc.getVIACEP(cep).subscribe((data) => {
      this.endereco2.rua = data.logradouro;
      this.endereco2.bairro = data.bairro;
      this.endereco2.cidade = data.localidade;
      this.endereco2.estado = data.estado || data.uf;
    });
  }

  private resetarSegundoProponente(): void {
    this.mostrarSegundoProponente = false;
    this.mesmoEndereco = true;
    this.copiarEndereco();
  }

  vlrTotal() {
    return this.proposta?.condicao?.reduce(
      (acc, c) => acc + (Number(c?.valorTotal ?? 0) || 0),
      0
    );
  }

  track = (_: number, item: Condicao) => item;

  recalc(i: number): void {
    const c = this.proposta.condicao[i];
    const q = this.toNumber(c.qtde);
    const v = this.toNumber(c.valorParcela);
    c.valorTotal = this.round2(q * v);
  }

  private toNumber(v: any): number {
    if (v === null || v === undefined || v === '') return 0;
    return Number(String(v).replace(/\./g, '').replace(',', '.')) || Number(v) || 0;
  }

  private round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  remover(i: number): void {
    this.proposta.condicao.splice(i, 1);
  }

  adicionar(): void {
    if (!this.proposta.condicao) {
      this.proposta.condicao = [];
    }
    this.proposta.condicao.push({
      qtde: 1,
      descricao: '',
      vencimento: moment().format(),
      valorParcela: 0,
      valorTotal: 0
    });
  }

  saveUser() {
    this.proposta.status = 'EM_ANALISE';

    this.proposalsService.create(this.proposta).subscribe({
      next: () => {
        this.toast.success('Proposta enviada para analise');
        this.buscar();
      },
      error: err => {
        console.error(err);
        this.toast.error(err.error?.message || 'Erro ao salvar proposta');
      }
    });
  }

  print(elementId: string) {
    setTimeout(() => {
      const conteudo = document.getElementById(elementId);

      if (!conteudo) {
        console.error('Area de impressao nao encontrada:', elementId);
        this.toast.error('Erro ao localizar conteudo para impressao.');
        return;
      }

      const html = conteudo.innerHTML;
      const janela = window.open('', '_blank');

      if (!janela) {
        this.toast.error('O navegador bloqueou a janela de impressao.');
        return;
      }

      janela.document.open();
      janela.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Imprimir Proposta</title>

          <style>
            @page { size: A4; margin: 12mm; }

            body {
              font-family: Arial, Helvetica, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-area {
              width: 100%;
            }

            svg, img {
              max-width: 100%;
            }
          </style>
        </head>

        <body>
          <div class="print-area">
            ${html}
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
      janela.document.close();
    }, 200);
  }

  exportar() {
    if (!this.items?.length) {
      this.toast.info('Nenhuma proposta para exportar.');
      return;
    }

    const linhas = [
      ['ID', 'Empreendimento', 'Unidade', 'Cliente', 'Valor', 'Status', 'Criada em'].join(';'),
      ...this.items.map(p => [
        p.id,
        p.empreendimentoID,
        p.unidadeID,
        p.clienteName,
        (p.vlrUnidade ?? 0).toString().replace('.', ','),
        this.normalizeStatus(p.status),
        new Date(p.createdAt).toLocaleString('pt-BR')
      ].join(';'))
    ];

    const csvContent = '\uFEFF' + linhas.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_propostas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    window.URL.revokeObjectURL(url);
  }
}


