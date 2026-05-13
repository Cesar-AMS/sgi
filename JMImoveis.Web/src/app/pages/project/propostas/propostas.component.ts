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
  empreendimentoNome?: string;
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

interface SimulacaoComissionamentoItem {
  data: string;
  descricao: string;
  quantidade: number;
  valorCliente: number;
  valorImobiliaria: number;
  valorConstrutora: number;
  saldoComissaoApos: number;
  observacao?: string;
}

interface SimulacaoComissionamento {
  valorImovel: number;
  percentualComissao: number;
  comissaoTotal: number;
  totalImobiliaria: number;
  totalConstrutora: number;
  saldoComissaoFinal: number;
  itens: SimulacaoComissionamentoItem[];
}

interface EventoSimulacaoComissionamento {
  data: string;
  descricao: string;
  quantidadeOriginal: number;
  parcelaNumero?: number;
  valorCliente: number;
  tipoDestino: 'comissao' | 'construtora' | 'pendente' | 'nao-classificada';
  observacao?: string;
  ordemCondicao: number;
  ordemParcela: number;
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
  @ViewChild('areaDocumentoProposta', { static: false }) areaDocumentoProposta!: ElementRef<HTMLElement>;

  modalRef?: BsModalRef;
  proposta: PropostaReserva = this.criarPropostaVazia();
  selectedProposalId?: number;
  approving = false;
  editandoProposta = false;
  salvandoEdicao = false;
  gerandoPdf = false;
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
  readonly currencyOptions = {
    prefix: 'R$ ',
    thousands: '.',
    decimal: ',',
    precision: 2,
    allowNegative: false,
    align: 'left'
  };
  readonly descricaoCondicaoOptions = [
    'Ato - JM',
    'Anual - JM',
    'Mensal',
    'FGTS',
    'Entrega de chaves',
    'Pós obras',
    'Financiamento',
    'Promoção',
    'Repasse Construtora'
  ];
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
    this.editandoProposta = true;

    setTimeout(() => this.modalReserva?.show());
  }

  private abrirFichaInicial(ficha: FichaPropostaInicial): void {
    this.proposta = {
      ...this.criarPropostaVazia(),
      unidadeID: String(ficha.unidadeId),
      unitName: ficha.unidadeNumero || String(ficha.unidadeId),
      empreendimentoID: ficha.empreendimentoId ? String(ficha.empreendimentoId) : '',
      enterPriseName: ficha.empreendimentoNome || '',
      vlrUnidade: ficha.valor ?? 0,
      status: 'RASCUNHO',
      condicao: []
    };
    this.resetarSegundoProponente();
    this.editandoProposta = true;

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
    if (this.gerandoPdf) {
      return;
    }

    const el = this.areaDocumentoProposta?.nativeElement;

    if (!el) {
      this.toast.error('Nao foi possivel localizar a area do PDF.');
      return;
    }

    this.gerandoPdf = true;
    el.classList.add('modo-download');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;

      await new Promise(r => setTimeout(r, 50));

      const scale = 1.3;
      const captureWidth = el.scrollWidth;
      const captureHeight = el.scrollHeight;

      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: captureWidth,
        windowHeight: captureHeight,
        width: captureWidth,
        height: captureHeight,
        y: 0
      });

      this.adicionarCanvasEmUmaPagina(pdf, canvas, margin, contentW, contentH);

      pdf.save(`proposta_${this.proposta?.enterPriseName || 'novo'}_${this.proposta?.clienteName ?? 'novo'}.pdf`);
    } finally {
      el.classList.remove('modo-download');
      this.gerandoPdf = false;
    }
  }

  private adicionarCanvasEmUmaPagina(
    pdf: jsPDF,
    canvas: HTMLCanvasElement,
    margin: number,
    contentW: number,
    contentH: number
  ): void {
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const imgW = contentW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const fitScale = Math.min(1, contentH / imgH);
    const finalW = imgW * fitScale;
    const finalH = imgH * fitScale;
    const x = margin + (contentW - finalW) / 2;
    const y = margin;

    pdf.addImage(imgData, 'JPEG', x, y, finalW, finalH);
  }

  private adicionarCanvasPaginado(
    pdf: jsPDF,
    canvas: HTMLCanvasElement,
    el: HTMLElement,
    margin: number,
    contentW: number,
    contentH: number
  ): void {
    const pxPerMm = canvas.width / contentW;
    const pageHeightPx = Math.floor(contentH * pxPerMm);
    const protectedRanges = this.obterFaixasProtegidasPdf(el, canvas);
    let offsetY = 0;
    let firstPage = true;

    while (offsetY < canvas.height) {
      const sliceEnd = this.calcularFimPaginaPdf(offsetY, pageHeightPx, canvas.height, protectedRanges);
      const sliceHeight = Math.max(1, sliceEnd - offsetY);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const context = pageCanvas.getContext('2d');
      if (!context) {
        throw new Error('Nao foi possivel preparar a pagina do PDF.');
      }

      context.drawImage(
        canvas,
        0,
        offsetY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      if (!firstPage) {
        pdf.addPage();
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
      const pageImgH = sliceHeight / pxPerMm;
      pdf.addImage(pageImgData, 'JPEG', margin, margin, contentW, pageImgH);

      firstPage = false;
      offsetY = sliceEnd;
    }
  }

  private obterFaixasProtegidasPdf(el: HTMLElement, canvas: HTMLCanvasElement): Array<{ top: number; bottom: number }> {
    const containerRect = el.getBoundingClientRect();
    const canvasScale = canvas.width / el.scrollWidth;

    return Array.from(el.querySelectorAll<HTMLElement>('.avoid-break'))
      .map((block) => {
        const rect = block.getBoundingClientRect();
        const top = Math.max(0, (rect.top - containerRect.top) * canvasScale);
        const bottom = Math.min(canvas.height, (rect.bottom - containerRect.top) * canvasScale);
        return { top, bottom };
      })
      .filter(range => range.bottom > range.top)
      .sort((a, b) => a.top - b.top);
  }

  private calcularFimPaginaPdf(
    offsetY: number,
    pageHeightPx: number,
    canvasHeight: number,
    protectedRanges: Array<{ top: number; bottom: number }>
  ): number {
    const naturalEnd = Math.min(offsetY + pageHeightPx, canvasHeight);

    if (naturalEnd >= canvasHeight) {
      return canvasHeight;
    }

    const minUsefulPageHeight = pageHeightPx * 0.45;
    const crossingRange = protectedRanges.find(range =>
      range.top > offsetY + minUsefulPageHeight &&
      range.top < naturalEnd &&
      range.bottom > naturalEnd &&
      range.bottom - range.top < pageHeightPx
    );

    return crossingRange
      ? Math.max(offsetY + 1, Math.floor(crossingRange.top))
      : naturalEnd;
  }

  private updatePagedItems(): void {
    this.totalItems = this.items?.length || 0;
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedItems = (this.items || []).slice(start, end);
  }

  private atualizarStatusNaLista(id: number, status: PropostaStatus): void {
    this.items = (this.items || []).map(item =>
      Number(item.id) === Number(id)
        ? { ...item, status }
        : item
    );
    this.updatePagedItems();
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
        this.editandoProposta = false;
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

  habilitarEdicaoProposta(): void {
    this.editandoProposta = true;
  }

  cancelarEdicaoProposta(): void {
    if (!this.proposta?.id) {
      this.editandoProposta = false;
      return;
    }

    this.openModal(this.proposta.id);
  }

  salvarEdicaoProposta(): void {
    if (!this.proposta?.id) {
      return;
    }

    if (this.mesmoEndereco) {
      this.copiarEndereco();
    }

    this.garantirVencimentosTecnicosCondicoes();
    this.normalizarEngCaixaParaBoolean();
    this.normalizarRendaParaString();
    this.salvandoEdicao = true;
    this.proposalsService.update(this.proposta.id, this.proposta).subscribe({
      next: () => {
        this.toast.success('Proposta atualizada com sucesso');
        this.editandoProposta = false;
        this.buscar();
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.message || 'Erro ao atualizar proposta');
      },
      complete: () => this.salvandoEdicao = false
    });
  }

  canEnviarParaAnalise(): boolean {
    return this.normalizeStatus(this.proposta?.status) === 'RASCUNHO';
  }

  canApprove(): boolean {
    const status = this.normalizeStatus(this.proposta?.status);
    return status === 'EM_ANALISE' || status === 'REPROVADO';
  }

  canReprovar(): boolean {
    const status = this.normalizeStatus(this.proposta?.status);
    return status === 'EM_ANALISE' || status === 'APROVADO';
  }

  enviarParaAnalise(): void {
    if (!this.proposta) {
      this.toast.warning('Preencha os dados obrigatórios antes de enviar para análise.');
      return;
    }

    this.normalizarEngCaixaParaBoolean();
    this.normalizarRendaParaString();

    if (!this.canEnviarParaAnalise()) {
      this.toast.warning('Apenas propostas em rascunho podem ser enviadas para análise.');
      return;
    }

    if (!this.proposta.id) {
      this.criarPropostaParaAnalise();
      return;
    }

    this.approving = true;
    this.proposalsService.enviarParaAnalise(this.proposta.id).subscribe({
      next: () => {
        this.proposta.status = 'EM_ANALISE';
        this.toast.success('Proposta enviada para análise com sucesso.');
        console.log('Sucesso no envio - chamando finalizar', {
          id: this.proposta?.id,
          status: this.proposta?.status,
          somenteModal: this.somenteModal,
          voltarAoEspelho: this.voltarAoEspelho
        });
        this.finalizarEnvioParaAnaliseComSucesso();
      },
      error: (err) => {
        console.error('Erro ao enviar proposta existente para análise', {
          status: err?.status,
          error: err?.error,
          message: err?.message,
          proposta: this.proposta
        });
        this.toast.error(this.extrairMensagemErroProposta(err));
      },
      complete: () => this.approving = false
    });
  }

  private criarPropostaParaAnalise(): void {
    if (this.mesmoEndereco) {
      this.copiarEndereco();
    }

    this.garantirVencimentosTecnicosCondicoes();
    this.normalizarEngCaixaParaBoolean();
    this.normalizarRendaParaString();

    if (!this.propostaEstaProntaParaAnalise()) {
      this.toast.warning('Preencha os dados obrigatórios antes de enviar para análise.');
      return;
    }

    this.approving = true;
    const statusAnterior = this.proposta.status;
    this.proposta.status = 'EM_ANALISE';

    this.proposalsService.create(this.proposta).subscribe({
      next: () => {
        this.toast.success('Proposta enviada para análise com sucesso.');
        console.log('Sucesso no envio - chamando finalizar', {
          id: this.proposta?.id,
          status: this.proposta?.status,
          somenteModal: this.somenteModal,
          voltarAoEspelho: this.voltarAoEspelho
        });
        this.finalizarEnvioParaAnaliseComSucesso();
      },
      error: (err) => {
        console.error('Erro ao criar proposta para análise RAW', err);
        console.error('Erro ao criar proposta para análise DETALHADO', {
          status: err?.status,
          statusText: err?.statusText,
          error: err?.error,
          message: err?.message,
          proposta: this.proposta
        });
        this.proposta.status = statusAnterior || 'RASCUNHO';
        this.toast.error(this.extrairMensagemErroProposta(err));
      },
      complete: () => this.approving = false
    });
  }

  private finalizarEnvioParaAnaliseComSucesso(): void {
    this.modalReserva?.hide();

    if (this.somenteModal) {
      this.fichaFechada.emit();
      this.router.navigate(['/jm/vendas/espelho']);
      return;
    }

    this.buscar();
  }

  private extrairMensagemErroProposta(err: any): string {
    const error = err?.error;

    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.errors && typeof error.errors === 'object') {
      const mensagens = Object.values(error.errors)
        .flat()
        .filter((msg): msg is string => typeof msg === 'string' && !!msg.trim());

      if (mensagens.length) {
        return mensagens.join(' ');
      }
    }

    if (error?.title) {
      return error.title;
    }

    return 'Não foi possível enviar a proposta para análise.';
  }

  private normalizarEngCaixaParaBoolean(): void {
    const valor = this.proposta?.engCaixa as any;

    if (typeof valor === 'boolean') {
      return;
    }

    if (typeof valor === 'string') {
      const normalizado = valor.trim().toLowerCase();
      this.proposta.engCaixa = normalizado === 'sim' || normalizado === 'true';
      return;
    }

    this.proposta.engCaixa = false;
  }

  private normalizarRendaParaString(): void {
    this.proposta.renda = this.converterValorParaString(this.proposta.renda);

    if (this.proposta.rendaSecondary !== undefined && this.proposta.rendaSecondary !== null) {
      this.proposta.rendaSecondary = this.converterValorParaString(this.proposta.rendaSecondary);
    }
  }

  private converterValorParaString(valor: any): string {
    if (valor === null || valor === undefined) {
      return '';
    }

    if (typeof valor === 'string') {
      return valor;
    }

    if (typeof valor === 'number') {
      return valor.toString();
    }

    return String(valor);
  }

  private propostaEstaProntaParaAnalise(): boolean {
    if (!this.proposta.empreendimentoID) return false;
    if (!this.proposta.unidadeID) return false;
    if (!this.toNumber(this.proposta.vlrUnidade)) return false;
    if (!this.proposta.clienteName?.trim()) return false;
    if (!this.proposta.cnpjCpf?.trim()) return false;
    if (!this.proposta.phoneOne?.trim()) return false;
    if (!this.proposta.emailCliente?.trim()) return false;

    const condicoes = this.proposta.condicao ?? [];
    if (!condicoes.length) return false;

    return condicoes.every((condicao) => {
      if (!condicao?.descricao?.trim()) return false;
      if (this.toNumber(condicao.qtde) <= 0) return false;
      if (!condicao.vencimento) return false;

      const valorParcela = this.toNumber(condicao.valorParcela);
      const valorTotal = this.toNumber(condicao.valorTotal);
      return valorParcela > 0 || valorTotal > 0;
    });
  }

  approveSelected() {
    if (!this.proposta?.id || !this.canApprove()) return;

    const propostaId = this.proposta.id;
    this.approving = true;
    this.proposalsService.approve(propostaId).subscribe({
      next: () => {
        this.proposta.status = 'APROVADO';
        this.atualizarStatusNaLista(propostaId, 'APROVADO');
        this.toast.success('Proposta aprovada');
        this.modalReserva.hide();
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

    const propostaId = this.proposta.id;
    this.approving = true;
    this.proposalsService.reprovar(propostaId).subscribe({
      next: () => {
        this.proposta.status = 'REPROVADO';
        this.atualizarStatusNaLista(propostaId, 'REPROVADO');
        this.toast.success('Proposta reprovada');
        this.modalReserva.hide();
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

  isDescricaoCondicaoPersonalizada(descricao?: string | null): boolean {
    return !!descricao && !this.descricaoCondicaoOptions.includes(descricao);
  }

  deveExibirVencimentoCondicao(descricao?: string | null): boolean {
    return ![
      'FGTS',
      'ENTREGADECHAVES',
      'POSOBRAS',
      'FINANCIAMENTO',
      'PROMOCAO',
      'REPASSECONSTRUTORA'
    ].includes(this.normalizarDescricaoCondicao(descricao));
  }

  onDescricaoCondicaoChange(condicao: Condicao, index: number): void {
    this.garantirVencimentoTecnicoCondicao(condicao);
    this.recalc(index);
  }

  private garantirVencimentosTecnicosCondicoes(): void {
    (this.proposta?.condicao ?? []).forEach((condicao) => this.garantirVencimentoTecnicoCondicao(condicao));
  }

  private garantirVencimentoTecnicoCondicao(condicao?: Condicao | null): void {
    if (condicao && !condicao.vencimento) {
      condicao.vencimento = moment().format('YYYY-MM-DD');
    }
  }

  calcularSimulacaoComissionamento(): SimulacaoComissionamento {
    const valorImovel = this.round2(this.toNumber(this.proposta?.vlrUnidade));
    const percentualComissao = 6;
    const comissaoTotal = this.round2(valorImovel * (percentualComissao / 100));
    let saldoComissao = comissaoTotal;
    let totalImobiliaria = 0;
    let totalConstrutora = 0;

    const itens = this.expandirCondicoesParaEventosSimulacao().map((evento) => {
      let valorImobiliaria = 0;
      let valorConstrutora = 0;
      let observacao = evento.observacao;

      if (evento.tipoDestino === 'comissao') {
        valorImobiliaria = this.round2(Math.min(evento.valorCliente, saldoComissao));
        valorConstrutora = this.round2(evento.valorCliente - valorImobiliaria);
        saldoComissao = this.round2(saldoComissao - valorImobiliaria);
      } else {
        valorConstrutora = evento.valorCliente;
      }

      totalImobiliaria = this.round2(totalImobiliaria + valorImobiliaria);
      totalConstrutora = this.round2(totalConstrutora + valorConstrutora);

      return {
        data: evento.data,
        descricao: evento.descricao,
        quantidade: evento.quantidadeOriginal,
        valorCliente: evento.valorCliente,
        valorImobiliaria,
        valorConstrutora,
        saldoComissaoApos: saldoComissao,
        observacao
      };
    });

    return {
      valorImovel,
      percentualComissao,
      comissaoTotal,
      totalImobiliaria,
      totalConstrutora,
      saldoComissaoFinal: saldoComissao,
      itens
    };
  }

  expandirCondicoesParaEventosSimulacao(): EventoSimulacaoComissionamento[] {
    const eventos: EventoSimulacaoComissionamento[] = [];

    (this.proposta?.condicao ?? []).forEach((condicao, ordemCondicao) => {
      const descricaoOriginal = condicao?.descricao || '';
      const descricaoNormalizada = this.normalizarDescricaoComissionamento(descricaoOriginal);

      if (descricaoNormalizada === 'POSOBRAS') {
        return;
      }

      const quantidadeOriginal = Math.max(Math.trunc(this.toNumber(condicao?.qtde)) || 1, 1);
      const valorParcela = this.round2(this.toNumber(condicao?.valorParcela));
      const valorTotal = this.toNumber(condicao?.valorTotal);
      const valorEventoUnico = this.round2(valorTotal > 0 ? valorTotal : quantidadeOriginal * valorParcela);
      const vencimento = this.normalizarVencimentoSimulacao(condicao?.vencimento);
      const observacaoData = vencimento.usouFallback
        ? 'Vencimento ausente; data atual usada na simulação'
        : undefined;

      const criarEvento = (
        data: string,
        descricao: string,
        valorCliente: number,
        tipoDestino: EventoSimulacaoComissionamento['tipoDestino'],
        ordemParcela: number,
        parcelaNumero?: number,
        observacao?: string
      ) => {
        eventos.push({
          data,
          descricao,
          quantidadeOriginal,
          parcelaNumero,
          valorCliente: this.round2(valorCliente),
          tipoDestino,
          observacao: this.combinarObservacoes(observacaoData, observacao),
          ordemCondicao,
          ordemParcela
        });
      };

      if (descricaoNormalizada === 'MENSAL') {
        for (let index = 0; index < quantidadeOriginal; index++) {
          criarEvento(
            this.adicionarPeriodoSimulacao(vencimento.data, index, 'month'),
            `${descricaoOriginal || 'Mensal'} ${index + 1}/${quantidadeOriginal}`,
            valorParcela,
            'comissao',
            index,
            index + 1
          );
        }

        return;
      }

      if (['ANUALJM', 'ANUALCONST', 'ANUALCONSTRUTORA'].includes(descricaoNormalizada)) {
        const tipoDestino = descricaoNormalizada === 'ANUALJM' ? 'comissao' : 'construtora';

        for (let index = 0; index < quantidadeOriginal; index++) {
          criarEvento(
            this.adicionarPeriodoSimulacao(vencimento.data, index, 'year'),
            `${descricaoOriginal || 'Anual'} ${index + 1}/${quantidadeOriginal}`,
            valorParcela,
            tipoDestino,
            index,
            index + 1
          );
        }

        return;
      }

      const classificacao = this.classificarDescricaoComissionamento(descricaoOriginal);
      const observacao = this.observacaoEventoUnicoSimulacao(descricaoNormalizada, classificacao);

      criarEvento(
        vencimento.data,
        descricaoOriginal || 'Condição',
        valorEventoUnico,
        classificacao,
        0,
        undefined,
        observacao
      );
    });

    return eventos.sort((a, b) => {
      const dataCompare = a.data.localeCompare(b.data);
      if (dataCompare !== 0) {
        return dataCompare;
      }

      if (a.ordemCondicao !== b.ordemCondicao) {
        return a.ordemCondicao - b.ordemCondicao;
      }

      return a.ordemParcela - b.ordemParcela;
    });
  }

  recalc(i: number): void {
    const c = this.proposta.condicao[i];

    if (!this.deveCalcularValorTotalAutomaticamente(c?.descricao)) {
      return;
    }

    const q = this.toNumber(c.qtde);
    const v = this.toNumber(c.valorParcela);
    c.valorTotal = this.round2(q * v);
  }

  deveCalcularValorTotalAutomaticamente(descricao?: string | null): boolean {
    return this.normalizarDescricaoCondicao(descricao) !== 'POSOBRAS';
  }

  textoEngenhariaCaixa(): string {
    const valor = this.proposta?.engCaixa;

    if (valor === true || String(valor).toLowerCase() === 'sim') {
      return 'Sim';
    }

    if (valor === false || String(valor).toLowerCase() === 'nao' || String(valor).toLowerCase() === 'não') {
      return 'Não';
    }

    return 'Não informado';
  }

  documentoCampo(valor: any): string {
    if (valor === null || valor === undefined || valor === '') {
      return '';
    }

    return String(valor);
  }

  documentoMoeda(valor: any): string {
    const numero = this.toNumber(valor);

    if (!numero) {
      return '';
    }

    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  documentoData(valor?: string | Date | null): string {
    if (!valor) {
      return '';
    }

    const data = moment(valor);
    return data.isValid() ? data.format('DD/MM/YYYY') : '';
  }

  dataAtualPorExtenso(): string {
    const data = this.today instanceof Date ? this.today : new Date();
    const dataFormatada = data.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `São Paulo, ${dataFormatada}.`;
  }

  documentoCidadeUf(cidade?: string | null, estado?: string | null): string {
    const partes = [cidade, estado]
      .map(parte => (parte || '').trim())
      .filter(Boolean);

    return partes.join('/');
  }

  documentoBloco(): string {
    const unitName = (this.proposta?.unitName || '').trim();
    const match = unitName.match(/\s([A-Za-z0-9]+)$/);

    if (!match || !/^Apto\s+/i.test(unitName)) {
      return '';
    }

    return match[1];
  }

  documentoCondicoesLinhas(): Array<Condicao | null> {
    const condicoes = this.proposta?.condicao ?? [];
    const linhasMinimas = 8;
    const linhasVazias = Math.max(linhasMinimas - condicoes.length, 0);

    return [
      ...condicoes,
      ...Array.from({ length: linhasVazias }, () => null)
    ];
  }

  documentoVencimento(condicao?: Condicao | null): string {
    if (!condicao || !this.deveExibirVencimentoCondicao(condicao.descricao)) {
      return '';
    }

    return this.documentoData(condicao.vencimento);
  }

  documentoEngenhariaMarcada(valorEsperado: 'sim' | 'nao'): string {
    const valor = this.proposta?.engCaixa;
    const normalizado = String(valor).trim().toLowerCase();

    if (valorEsperado === 'sim' && (valor === true || normalizado === 'sim')) {
      return 'X';
    }

    if (valorEsperado === 'nao' && (valor === false || normalizado === 'nao' || normalizado === 'não')) {
      return 'X';
    }

    return '';
  }

  private toNumber(v: any): number {
    if (v === null || v === undefined || v === '') return 0;
    return Number(String(v).replace(/\./g, '').replace(',', '.')) || Number(v) || 0;
  }

  private round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  private classificarDescricaoComissionamento(descricao?: string | null): 'comissao' | 'construtora' | 'pendente' | 'nao-classificada' {
    const normalized = this.normalizarDescricaoComissionamento(descricao);

    if (['ATOCOMISSAO', 'ATOJM', 'COMISSAO', 'ANUALJM', 'MENSAL'].includes(normalized)) {
      return 'comissao';
    }

    if (['ATOCONSTRUTORA', 'ANUALCONST', 'ANUALCONSTRUTORA', 'REPASSECONSTRUTORA'].includes(normalized)) {
      return 'construtora';
    }

    if (['FGTS', 'ENTREGADECHAVES', 'POSOBRAS', 'FINANCIAMENTO', 'PROMOCAO'].includes(normalized)) {
      return 'pendente';
    }

    return 'nao-classificada';
  }

  private normalizarDescricaoComissionamento(descricao?: string | null): string {
    return this.normalizarDescricaoCondicao(descricao);
  }

  private normalizarDescricaoCondicao(descricao?: string | null): string {
    return (descricao || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[\s\-_]/g, '');
  }

  private normalizarVencimentoSimulacao(vencimento?: string | null): { data: string; usouFallback: boolean } {
    const raw = (vencimento || '').trim();
    const data = raw.length >= 10 ? raw.slice(0, 10) : raw;
    const parsed = moment(data, 'YYYY-MM-DD', true);

    if (parsed.isValid()) {
      return { data: parsed.format('YYYY-MM-DD'), usouFallback: false };
    }

    return { data: moment().format('YYYY-MM-DD'), usouFallback: true };
  }

  private adicionarPeriodoSimulacao(data: string, quantidade: number, unidade: 'month' | 'year'): string {
    return moment(data, 'YYYY-MM-DD').add(quantidade, unidade).format('YYYY-MM-DD');
  }

  private observacaoEventoUnicoSimulacao(
    descricaoNormalizada: string,
    classificacao: EventoSimulacaoComissionamento['tipoDestino']
  ): string | undefined {
    switch (descricaoNormalizada) {
      case 'FGTS':
      case 'PROMOCAO':
        return 'Regra comercial pode exigir conferência futura';
      case 'POSOBRAS':
        return 'Pós obras tratado como evento único nesta simulação';
      case 'FINANCIAMENTO':
        return 'Financiamento tratado como evento único nesta simulação';
      default:
        return classificacao === 'nao-classificada'
          ? 'Descrição não classificada; conferência futura recomendada'
          : undefined;
    }
  }

  private combinarObservacoes(...observacoes: Array<string | undefined>): string | undefined {
    const validas = observacoes.filter((observacao): observacao is string => !!observacao);
    return validas.length ? validas.join(' ') : undefined;
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
      vencimento: moment().format('YYYY-MM-DD'),
      valorParcela: 0,
      valorTotal: 0
    });
  }

  saveUser() {
    this.criarPropostaParaAnalise();
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


