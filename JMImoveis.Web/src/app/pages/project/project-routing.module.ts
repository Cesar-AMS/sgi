import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClientListComponent } from './clientes/client-list/client-list.component';
import { ComparecimentosComponent } from './comparecimentos/comparecimentos.component';
import { GeraisComponent } from './configuracoes/gerais/gerais.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home.component';
import { AdminEmpreendimentoComponent } from './empreendimentos/admin-empreendimento/admin-empreendimento.component';
import { CadastroComponent } from './empreendimentos/cadastro/cadastro.component';
import { ConstrutoraComponent } from './empreendimentos/construtora/construtora.component';
import { EspelhoComponent } from './empreendimentos/espelho/espelho.component';
import { AccountsPayableComponent } from './financeiro/accounts-payable/accounts-payable.component';
import { AccountsReceivableComponent } from './financeiro/accounts-receivable/accounts-receivable.component';
import { CentroCustoComponent } from './financeiro/centro-custo/centro-custo.component';
import { ContasContabeisComponent } from './financeiro/contas-contabeis/contas-contabeis.component';
import { DreComponent } from './financeiro/dre/dre.component';
import { FluxoCaixaComponent } from './financeiro/fluxo-caixa/fluxo-caixa.component';
import { ProjecaoComponent } from './financeiro/projecao/projecao.component';
import { LeadDetailsComponent } from './leads-details/leads-details.component';
import { LeadsComponent } from './leads/leads.component';
import { PropostasComponent } from './propostas/propostas.component';
import { ControleFuncionariosComponent } from './rh/controle-funcionarios/controle-funcionarios.component';
import { ControleFaltasComponent } from './rh/controle-faltas/controle-faltas.component';
import { ControleUniformeComponent } from './rh/controle-uniforme/controle-uniforme.component';
import { FeriasComponent } from './rh/ferias/ferias.component';
import { FolhaPagamentosComponent } from './rh/folha-pagamentos/folha-pagamentos.component';
import { ComparecimentosComponent as StandaloneComparecimentosComponent } from './comparecimentos/comparecimentos.component';
import { VisitasComponent } from './visitas/visitas.component';
import { CorretorComponent } from './vendas/corretor/corretor.component';
import { DesistenciasComponent } from './vendas/desistencias/desistencias.component';
import { VendasNewComponent } from './vendas/vendas-new/vendas-new.component';
import { ViewCorretorComponent } from './vendas/view-corretor/view-corretor.component';
import { VisaoGeralComponent } from './vendas/visao-geral/visao-geral.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardHomeComponent,
  },
  {
    path: 'vendas/visao-geral',
    component: VisaoGeralComponent,
  },
  {
    path: 'vendas/new',
    component: VendasNewComponent,
  },
  {
    path: 'vendas/edit/:id',
    component: VendasNewComponent,
  },
  {
    path: 'vendas/corretor',
    component: CorretorComponent,
  },
  {
    path: 'vendas/corretor/view/:id',
    component: ViewCorretorComponent,
  },
  {
    path: 'vendas/propostas',
    component: PropostasComponent,
  },
  {
    path: 'vendas/proposta',
    redirectTo: 'vendas/propostas',
    pathMatch: 'full',
  },
  {
    path: 'vendas/desistencias',
    component: DesistenciasComponent,
  },
  {
    path: 'financeiro/centro-custo',
    component: CentroCustoComponent,
  },
  {
    path: 'financeiro/contas-contabeis',
    component: ContasContabeisComponent,
  },
  {
    path: 'financeiro/contas-pagar',
    component: AccountsPayableComponent,
  },
  {
    path: 'financeiro/contas-receber',
    component: AccountsReceivableComponent,
  },
  {
    path: 'financeiro/dre',
    component: DreComponent,
  },
  {
    path: 'financeiro/fluxo-caixa',
    component: FluxoCaixaComponent,
  },
  {
    path: 'financeiro/projecao',
    component: ProjecaoComponent,
  },
  {
    path: 'rh/controle-funcionarios',
    component: ControleFuncionariosComponent,
  },
  {
    path: 'rh/controle-faltas',
    component: ControleFaltasComponent,
  },
  {
    path: 'rh/folha-pagamentos',
    component: FolhaPagamentosComponent,
  },
  {
    path: 'rh/ferias',
    component: FeriasComponent,
  },
  {
    path: 'rh/controle-uniforme',
    component: ControleUniformeComponent,
  },
  {
    path: 'leads',
    redirectTo: 'atendimento/leads/listagem',
    pathMatch: 'full',
  },
  {
    path: 'atendimento/leads/listagem',
    component: LeadsComponent,
  },
  {
    path: 'atendimento/leads/andamento',
    redirectTo: 'atendimento/leads/listagem',
    pathMatch: 'full',
  },
  {
    path: 'atendimento/leads/:id',
    component: LeadDetailsComponent,
  },
  {
    path: 'leads/:id',
    redirectTo: 'atendimento/leads/:id',
    pathMatch: 'full',
  },
  {
    path: 'clientes',
    component: ClientListComponent,
  },
  {
    path: 'settings',
    component: GeraisComponent,
  },
  {
    path: 'construtora',
    component: ConstrutoraComponent,
  },
  {
    path: 'empreendimentos',
    component: CadastroComponent,
  },
  {
    path: 'unidades',
    component: EspelhoComponent,
  },
  {
    path: 'empreendimentos/gerenciar/:id',
    component: AdminEmpreendimentoComponent,
  },
  {
    path: 'visitas',
    component: VisitasComponent,
  },
  {
    path: 'atendimento/agendamento',
    component: VisitasComponent,
  },
  {
    path: 'comparecimento',
    component: StandaloneComparecimentosComponent,
  },
  {
    path: 'propostas',
    redirectTo: 'vendas/propostas',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}
