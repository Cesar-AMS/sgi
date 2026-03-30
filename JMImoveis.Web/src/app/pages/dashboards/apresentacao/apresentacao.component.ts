import { Component, HostListener, OnInit } from '@angular/core';
import { ComissoesService, ResumoGerente } from 'src/app/core/services/comissoes.service';

@Component({
  selector: 'app-apresentacao',
  templateUrl: './apresentacao.component.html',
  styleUrl: './apresentacao.component.scss'
})
export class ApresentacaoComponent implements OnInit{
  
  mesSelecionado = this.formatYYYYMM(new Date());       // ex: "2025-09"
  gerentes: ResumoGerente[] = [];
  gerenteIndex = 0;

  apresentacao = false; // modo tela cheia

  constructor(private svc: ComissoesService) {}

  ngOnInit(): void {
    this.carregar();
  }

  private formatYYYYMM(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  carregar() {
    const yyyymm = this.mesSelecionado.replace('-', '');
    this.svc.listarPorMes(yyyymm).subscribe(list => {
      this.gerentes = list;
      this.gerenteIndex = 0;
    });
  }

  get atual(): ResumoGerente | null {
    return this.gerentes.length ? this.gerentes[this.gerenteIndex] : null;
  }

  get totalPagamentos(): number {
    return this.atual?.pagamentos.reduce((s, p) => s + p.valor, 0) ?? 0;
  }

  get devedor(): number {
    // pela arte: Devedor = total pagos - total do ATO (valor que a empresa precisa cobrir)
    return this.totalPagamentos - (this.atual?.totalAto ?? 0);
  }

  // UI actions
  setGerenteById(id: string) {
    const idx = this.gerentes.findIndex(g => g.gerenteId === id);
    if (idx >= 0) this.gerenteIndex = idx;
  }

  next() {
    if (!this.gerentes.length) return;
    this.gerenteIndex = (this.gerenteIndex + 1) % this.gerentes.length;
  }

  prev() {
    if (!this.gerentes.length) return;
    this.gerenteIndex = (this.gerenteIndex - 1 + this.gerentes.length) % this.gerentes.length;
  }

  abrirApresentacao() { this.apresentacao = true; }
  fecharApresentacao() { this.apresentacao = false; }

  // Navegação por teclado no modo apresentação
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.apresentacao) return;
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'Escape') this.fecharApresentacao();
  }

  // Clique/touch: direita → próximo | esquerda → anterior
  onOverlayClick(ev: MouseEvent | TouchEvent) {
    if (ev instanceof MouseEvent) {
      const mid = (ev.currentTarget as HTMLElement).getBoundingClientRect().width / 2;
      const x = ev.offsetX;
      x > mid ? this.next() : this.prev();
    } else {
      // touch: qualquer toque avança
      this.next();
    }
  }

}
