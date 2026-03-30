import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-corretor',
  templateUrl: './view-corretor.component.html',
  styleUrl: './view-corretor.component.scss'
})
export class ViewCorretorComponent implements OnInit {
   userId!: string;
  user: any;

  mockUsers: any = {
    ana: {
      id: 'ana',
      name: 'Ana Silva',
      role: 'Agente de Atendimento',
      active: true,
      cpf: '123.456.789-00',
      email: 'ana.silva@comishub.com',
      phone: '(11) 99999-9999',
      admission: '14/03/2023',
      pix: '123.456.789-00',
      pixType: 'CPF',
      totals: {
        base: 2400,
        commission: 845.50,
        valeTransporte: 220,
        valeAlimentacao: 300,
        bonificacoes: 180.50,
        aniversario: 150,
        descontos: -105
      }
    }
    // outros usuários aqui...
  };

constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.user = this.mockUsers[this.userId];
  }

  total(): number {
    const t = this.user.totals;
    return t.base + t.commission + t.valeTransporte + t.valeAlimentacao +
           t.bonificacoes + t.aniversario + t.descontos;
  }
}
