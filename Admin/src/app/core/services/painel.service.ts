import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatrizResponse, NovoLancamento, TabKey } from 'src/app/models/painel';

@Injectable({ providedIn: 'root' })
export class PainelService {
  constructor(private http: HttpClient) {}

  private endpointOf(tab: TabKey): string {
    switch (tab) {
      case 'vendas':        return '/api/painel/vendas';
      case 'ajuda':         return '/api/painel/ajuda-custo';
      case 'comissoes':     return '/api/painel/comissoes';
      case 'premiacoes':    return '/api/painel/premiacoes';
      case 'vale':          return '/api/painel/vale';
      case 'totalPagar':    return '/api/painel/total-a-pagar';
      case 'inadimplente':  return '/api/painel/inadimplente';
    }
  }

  getMatriz(tab: TabKey, ano: number) {
    const params = new HttpParams().set('ano', ano);
    return this.http.get<MatrizResponse<number>>(this.endpointOf(tab), { params });
  }

  adicionarLancamento(body: NovoLancamento) {
    return this.http.post<void>(this.endpointOf(body.tab), body);
  }
}
