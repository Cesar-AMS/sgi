import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalVendaComponent } from '../../modal-venda/modal-venda.component';
import { Apartamento } from 'src/app/core/data/empreendimento';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Construtoras, Empreendimento, Filial } from 'src/app/models/ContaBancaria';
import { ApiService } from 'src/app/core/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
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

export class EspelhoComponent implements OnInit {

  @ViewChild('meuModal', { static: false }) meuModal!: ModalVendaComponent;
  @ViewChild('modalReserva', { static: false }) modalReserva!: ModalDirective;

@ViewChild('areaA4Ref', { static: false }) areaA4Ref!: ElementRef;


   grupos: GrupoBloco[] = [];
  construtora: Construtoras[] = [];
  empreendimentos: Empreendimento[] = [];
  condicoes: Condicao[] = [];
  filiais: Filial[] = [];
  today = new Date();
  // bread crumb items
  breadCrumbItems!: Array<{}>;

  dependent: boolean = false

  track = (_: number, item: Condicao) => item;
  listagem: Grupo[] = [];
  construtorFilter: string = '';
  empreendimentoFilter: string = ''
  invoices: any;
  submitted = false;
  InvoicesForm!: UntypedFormGroup;
  paymentSign = "$";
  subtotal = 0;
  taxRate = 0.18;
  shippingRate = 65.0;
  discountRate = 0.30;
  proposta: PropostaReserva = {
  id:0, empreendimentoID: '', unidadeID: '',
  engCaixa: false, vlrUnidade: 0,
  clienteName: '', dateNascimento: '', cnpjCpf: '', rg: '', emailCliente: '',
  phoneOne: '', phoneTwo: '', estadoCivil: '', profissao: '', renda: '',
  clienteNameSecondary: '', dataNascimentoSecondary: '', cnpjCPFSecondary: '',
  rgSecondary: '', emailClienteSecondary: '', phoneOneSecondary: '',
  phoneTwoSecondary: '', estadoCivilSecondary: '', profissaoSecondary: '',
  rendaSecondary: '',
  cep: '', rua: '', nro: '', comp: '', bairro: '', cidade: '', estado: '',
  corretorID: '', gerenteID: '',
  status: 'OPEN', createdAt: '',
  condicao: []
};


  userForm!: UntypedFormGroup;
  forms: any = []; // Array to store form indices

  // -----------------------------
  visuDispo: boolean = true;

  apartamentos: Apartamento[] = [];

  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;


    constructor(private route: ActivatedRoute, private formBuilder: UntypedFormBuilder, public router: Router, private service: ApiService, public toast: ToastrService) {
    this.userForm = this.formBuilder.group({
      productName: ['', [Validators.required]],
      rate: ['', [Validators.required]],
      quantity: [0],
      price: []
    })
  }

  
  ngOnInit() {

     
    this.service.getConstrutora().subscribe((data) => {
      this.construtora = data
    })

    this.service.getFiliais().subscribe((data) => {
      this.filiais = data;
    });

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

    // transforma em array e ordena: bloco A→Z, andar 1→N, número crescente
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

  changeEmpreendimento(){
    this.apartamentos = []
    this.service.getApartamentEspelho(this.empreendimentoFilter).subscribe((data)=>{
      this.apartamentos = data
      this.proposta.empreendimentoID = this.empreendimentoFilter
    this.grupos = this.groupByBlocoAndAndar(data);

    })
  }


  changeEnterprise(){
    this.service.getEmpreendimentosBYConstrutor(this.construtorFilter).subscribe((data)=>{
      this.empreendimentos = data
    })

    this.apartamentos = []
  }
  

  salvar() {
  if (!this.proposta.clienteName || !this.proposta.cnpjCpf) {
    alert('Preencha Nome e CPF do 1º comprador!');
    return;
  }
  console.log(this.proposta);
}

  cep(){

    var cep = this.proposta.cep.replace('-','')

    this.service.getVIACEP(cep).subscribe((data)=>
    {
      this.proposta.rua = data.logradouro
      this.proposta.bairro = data.bairro
      this.proposta.cidade = data.localidade
      this.proposta.estado = data.estado
    })

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

  saveUser(){
    if (!this.isPropostaValida()) {
    this.toast.warning('Preencha todos os campos obrigatórios da proposta.');
    return;
  }

    this.service.createProposta(this.proposta).subscribe(()=>{
      this.toast.success('Proposta criada com sucesso')
    })
  }

  isPropostaValida(): boolean {

  if (!this.proposta.clienteName) return false;
  if (!this.proposta.cnpjCpf) return false;
  if (!this.proposta.phoneOne) return false;
  if (!this.proposta.emailCliente) return false;

  if (!this.proposta.cep) return false;
  if (!this.proposta.rua) return false;
  if (!this.proposta.nro) return false;
  if (!this.proposta.bairro) return false;
  if (!this.proposta.cidade) return false;
  if (!this.proposta.estado) return false;

  if (this.proposta.engCaixa === null || this.proposta.engCaixa === undefined)
    return false;

  if (!this.proposta.condicao || this.proposta.condicao.length === 0)
    return false;

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

  setUnit(id: number, amount: number){
    this.proposta.unidadeID = id.toString()
    this.proposta.vlrUnidade = amount
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

  vlrTotal(){
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
      const bloco = u.bloco?.toString().trim() || '—';
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
      disp: x === 'AVAILABLE' || x === 'DISPONÍVEL',
      res:  x === 'RESERVED'  || x === 'RESERVADO',
      vend: x === 'SELL'      || x === 'VENDIDO'
    };
  }

  trackBloco(_: number, b: GrupoBloco) { return b.bloco; }
  trackAndar(_: number, a: GrupoAndar) { return a.andar; }
  trackUnidade(_: number, u: Apartamento)   { return u.id ?? `${u.bloco}-${u.andar}-${u.numero}`; }

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
