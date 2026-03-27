// src/app/services/comissoes.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PagamentoPorFuncao {
  funcao: 'Agente + Estagiário' | 'Gerente' | 'Diretor' | 'Corretor' | 'Coordenador';
  valor: number;
}

export interface ResumoGerente {
  gerenteId: string;
  gerenteNome: string;
  vendedorNome: string;   // “Mickael Franklin” na arte
  totalAto: number;       // 19500.00
  mediaAto: number;       // 2166.67
  pagamentos: PagamentoPorFuncao[];
  observacao?: string;    // rodapé
}

@Injectable({ providedIn: 'root' })
export class ComissoesService {
  /** Simula leitura por mês (yyyymm) */
  listarPorMes(yyyymm: string): Observable<ResumoGerente[]> {
    // MOCK para você ver funcionando; troque pelos dados reais
    const base: ResumoGerente[] = [
      {
        gerenteId: 'g1',
        gerenteNome: 'João Gerente',
        vendedorNome: 'Mickael Franklin',
        totalAto: 19500,
        mediaAto: 2166.67,
        pagamentos: [
          { funcao: 'Agente + Estagiário', valor: 950 },
          { funcao: 'Gerente', valor: 12220 },
          { funcao: 'Diretor', valor: 2456.70 },
          { funcao: 'Corretor', valor: 3007.20 },
          { funcao: 'Coordenador', valor: 7370.09 },
        ],
        observacao: 'JM Imóveis, teve que desembolsar R$ 6.503,99 para poder pagar todos no dia 05!'
      },
      {
        gerenteId: 'g2',
        gerenteNome: 'Maria Gerente',
        vendedorNome: 'Ana Souza',
        totalAto: 15800,
        mediaAto: 1975.00,
        pagamentos: [
          { funcao: 'Agente + Estagiário', valor: 800 },
          { funcao: 'Gerente', valor: 9000 },
          { funcao: 'Diretor', valor: 1800 },
          { funcao: 'Corretor', valor: 2800 },
          { funcao: 'Coordenador', valor: 5200 },
        ],
        observacao: 'Valores consolidados do período.'
      },
    ];
    return of(base);
  }
}
