import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/core/services/api.service';
import { ProposalsService } from 'src/app/core/services/proposals.service';
import { PropostaReserva } from 'src/app/models/proposta-reserva';
import { Condicao } from '../empreendimentos/espelho/espelho.component';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Apartamento } from 'src/app/core/data/empreendimento';
import { Empreendimento } from 'src/app/models/ContaBancaria';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export type PropostaStatus = 'RASCUNHO' | 'EM_ANALISE' | 'APROVADO' | 'REPROVADO';

@Component({
  selector: 'app-propostas',
  templateUrl: './propostas.component.html',
  styleUrls: ['./propostas.component.scss']
})
export class PropostasComponent implements OnInit {
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
  proposta: PropostaReserva = {} as PropostaReserva;
  selectedProposalId?: number;
  approving = false;
  empreendimentos: Empreendimento[] = [];
  gerentes: any[] = [];
  corretores: any[] = [];
  construtorFilter = '';
  apartamentos: Apartamento[] = [];
  today = new Date();

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private svc: ApiService,
    private proposalsService: ProposalsService
  ) {}

  ngOnInit(): void {
    const hoje = new Date();
    const de = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
    const ate = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10);

    this.form = this.fb.group({
      de: [de],
      ate: [ate],
      status: ['ALL'],
      gerente: [''],
      corretor: ['']
    });

    this.buscar();
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
    const { de, ate, status, gerente, corretor } = this.form.value;

    this.proposalsService.list({ de, ate, status, gerente, corretor }).subscribe({
      next: res => {
        this.items = (res || []).map(item => ({
          ...item,
          status: this.normalizeStatus(item.status)
        }));
        this.page = 1;
        this.updatePagedItems();
      },
      error: err => console.error(err),
      complete: () => this.loading = false
    });
  }

  openModal(id: number) {
    this.selectedProposalId = id;
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
      'bg-secondary': s === 'RASCUNHO',
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
      this.proposta.estado = data.estado;
    });
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
    this.proposta.status = 'RASCUNHO';

    this.proposalsService.create(this.proposta).subscribe({
      next: () => {
        this.toast.success('Proposta criada com sucesso');
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


