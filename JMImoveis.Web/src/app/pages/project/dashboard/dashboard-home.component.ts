import { Component } from '@angular/core';

type ShortcutCard = {
  title: string;
  description: string;
  route: string;
  icon: string;
  accent: string;
};

type SummaryCard = {
  title: string;
  value: string;
  helper: string;
  accent: string;
};

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss',
})
export class DashboardHomeComponent {
  shortcuts: ShortcutCard[] = [
    {
      title: 'Leads',
      description: 'Acompanhar captação e andamento comercial.',
      route: '/jm/atendimento/leads/listagem',
      icon: 'ph-user-plus',
      accent: 'accent-blue',
    },
    {
      title: 'Agendamento',
      description: 'Controlar visitas e agenda de atendimento.',
      route: '/jm/atendimento/agendamento',
      icon: 'ph-calendar-check',
      accent: 'accent-orange',
    },
    {
      title: 'Propostas',
      description: 'Consultar propostas e apoiar conversão.',
      route: '/jm/propostas',
      icon: 'ph-file-text',
      accent: 'accent-green',
    },
    {
      title: 'Contas a Receber',
      description: 'Acompanhar entradas e pendências financeiras.',
      route: '/jm/financeiro/contas-receber',
      icon: 'ph-currency-circle-dollar',
      accent: 'accent-purple',
    },
    {
      title: 'Contas a Pagar',
      description: 'Visualizar compromissos e obrigações do período.',
      route: '/jm/financeiro/contas-pagar',
      icon: 'ph-receipt',
      accent: 'accent-red',
    },
    {
      title: 'Controle de Funcionários',
      description: 'Acessar o acompanhamento operacional do RH.',
      route: '/jm/rh/controle-funcionarios',
      icon: 'ph-users-three',
      accent: 'accent-teal',
    },
  ];

  summaries: SummaryCard[] = [
    {
      title: 'Frente Comercial',
      value: 'Leads, propostas e desistências',
      helper: 'Visão rápida da operação comercial e do funil.',
      accent: 'accent-blue',
    },
    {
      title: 'Financeiro',
      value: 'Receber, pagar, DRE e projeção',
      helper: 'Resumo das principais entradas do domínio financeiro.',
      accent: 'accent-green',
    },
    {
      title: 'Atendimento',
      value: 'Leads e agendamentos',
      helper: 'Foco na ponta do atendimento e no fluxo de visitas.',
      accent: 'accent-orange',
    },
    {
      title: 'RH',
      value: 'Equipe, faltas, férias e uniforme',
      helper: 'Acesso rápido aos controles internos de pessoas.',
      accent: 'accent-purple',
    },
  ];
}
