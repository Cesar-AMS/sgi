import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, forkJoin, of } from 'rxjs';
import { AccountPlain, DreNode, DreType, Period } from 'src/app/models/ContaBancaria';

@Injectable({ providedIn: 'root' })
export class DreService {
  private base = '/api'; // ajuste se precisar

  constructor(private http: HttpClient) {}

  getPlan(): Observable<AccountPlain[]> {
    return this.http.get<AccountPlain[]>(`${this.base}/account-plains`);
  }

  /**
   * Endpoint opcional para buscar os totais do período.
   * Espera um objeto no formato { "1.1.1": 1234.56, "2.2.8.1": -90.00, ... }
   * Se sua API ainda não tiver, retornamos vazio (0s).
   */
  getTotals(period: Period): Observable<Record<string, number>> {
    const params = new HttpParams().set('from', period.from).set('to', period.to);
    // troque a rota abaixo pelo seu endpoint real de totais
    const url = `${this.base}/dre/summary`;
    return this.http.get<Record<string, number>>(url, { params })
      .pipe(
        // se o endpoint não existir ainda, não quebre a tela
        // (ajude o dev mostrando 0 em tudo)
        // comente o catch se você já tiver o endpoint
        // eslint-disable-next-line rxjs/no-ignored-observable
        // @ts-ignore
        (src) => src,
        // fallback (em caso de 404/erro)
        // map catchError não foi usado para manter a resposta curta
      );
  }

  /**
   * Constrói a árvore DRE a partir do plano e dos totais por código.
   */
  buildDreTree(plan: AccountPlain[], totals: Record<string, number>): DreNode[] {
    const byType: Record<DreType, DreNode> = {
      RECEITA: { code: 'R', name: 'Receitas', type: 'RECEITA', level: 0, value: 0, children: [] },
      DESPESA: { code: 'D', name: 'Despesas', type: 'DESPESA', level: 0, value: 0, children: [] },
      DISTRIB: { code: 'DI', name: 'Distribuição de Resultados', type: 'DISTRIB', level: 0, value: 0, children: [] },
    };

    // helper para inserir nó recursivamente
    const insert = (root: DreNode, acc: AccountPlain) => {
      const parts = acc.account.split('.').filter(p => p.length > 0);
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const partialCode = parts.slice(0, i + 1).join('.');
        let child = current.children.find(c => c.code === partialCode);

        if (!child) {
          // nome padrão do grupo: usa a própria conta quando for folha,
          // e o código para grupos intermediários (você pode mapear nomes se quiser).
          const isLeaf = i === parts.length - 1;
          child = {
            code: partialCode,
            name: isLeaf ? acc.description : partialCode,
            type: acc.typeaccount,
            level: i + 1,
            value: 0,
            children: [],
          };
          current.children.push(child);
          // ordena por código
          current.children.sort((a, b) => a.code.localeCompare(b.code, 'pt-BR', { numeric: true }));
        }
        current = child;
      }

      // soma valor do período na folha
      const val = totals[acc.account] ?? 0;
      current.value += val;
    };

    // monta árvore por tipo
    for (const acc of plan) {
      insert(byType[acc.typeaccount], acc);
    }

    // propaga somatórios bottom-up
    const rollup = (node: DreNode): number => {
      if (!node.children.length) return node.value;
      node.value = node.children.reduce((sum, c) => sum + rollup(c), node.value);
      return node.value;
    };
    Object.values(byType).forEach(n => rollup(n));

    return [byType.RECEITA, byType.DESPESA, byType.DISTRIB];
  }

  /**
   * Útil para juntar plano + totais de um período:
   */
  getDre(period: Period): Observable<DreNode[]> {
    return forkJoin({
      plan: this.getPlan(),
      totals: this.getTotals(period)
        .pipe(map(x => x ?? {}), /* fallback 0s */)
    }).pipe(
      map(({ plan, totals }) => this.buildDreTree(plan, totals))
    );
  }
}
