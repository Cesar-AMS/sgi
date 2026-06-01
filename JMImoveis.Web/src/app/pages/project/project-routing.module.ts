import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AtendimentoRelatoriosComponent } from './atendimento-relatorios/atendimento-relatorios.component';
import { AtendimentoGestaoComponent } from './atendimento-gestao/atendimento-gestao.component';
import { ClientListComponent } from './clientes/client-list/client-list.component';
import { ComparecimentosComponent } from './comparecimentos/comparecimentos.component';
import { GeraisComponent } from './configuracoes/gerais/gerais.component';
import { ContractComponent } from './contract/contract.component';
import { ConstructorTransferComponent } from './constructor-transfer/constructor-transfer.component';
import { CreditAnalysisComponent } from './credit-analysis/credit-analysis.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home.component';
import { AdminEmpreendimentoComponent } from './empreendimentos/admin-empreendimento/admin-empreendimento.component';
import { CadastroComponent } from './empreendimentos/cadastro/cadastro.component';
import { ConstrutoraComponent } from './empreendimentos/construtora/construtora.component';
import { EspelhoComponent } from './empreendimentos/espelho/espelho.component';
import { AccountsPayableComponent } from './financeiro/accounts-payable/accounts-payable.component';
import { AccountsReceivableComponent } from './financeiro/accounts-receivable/accounts-receivable.component';
import { CentroCustoComponent } from './financeiro/centro-custo/centro-custo.component';
import { ContasContabeisComponent } from './financeiro/contas-contabeis/contas-contabeis.component';
import { FluxoCaixaComponent } from './financeiro/fluxo-caixa/fluxo-caixa.component';
import { ProjecaoComponent } from './financeiro/projecao/projecao.component';
import { LeadDetailsComponent } from './leads-details/leads-details.component';
import { LeadDistributionAgentsComponent } from './lead-distribution-agents/lead-distribution-agents.component';
import { LeadInterestRegionsComponent } from './lead-interest-regions/lead-interest-regions.component';
import { LeadSourcesComponent } from './lead-sources/lead-sources.component';
import { LeadsComponent } from './leads/leads.component';
import { PosVisitaComponent } from './pos-visita/pos-visita.component';
import { ControleFuncionariosComponent } from './rh/controle-funcionarios/controle-funcionarios.component';
import { ControleFaltasComponent } from './rh/controle-faltas/controle-faltas.component';
import { ControleUniformeComponent } from './rh/controle-uniforme/controle-uniforme.component';
import { FeriasComponent } from './rh/ferias/ferias.component';
import { FolhaPagamentosComponent } from './rh/folha-pagamentos/folha-pagamentos.component';
import { ComparecimentosComponent as StandaloneComparecimentosComponent } from './comparecimentos/comparecimentos.component';
import { PerfisAcessosComponent } from './configuracoes/perfis-acessos/perfis-acessos.component';
import { VisitasComponent } from './visitas/visitas.component';
import { CorretorComponent } from './vendas/corretor/corretor.component';
import { DesistenciasComponent } from './vendas/desistencias/desistencias.component';
import { VendasNewComponent } from './vendas/vendas-new/vendas-new.component';
import { ViewCorretorComponent } from './vendas/view-corretor/view-corretor.component';
import { VisaoGeralComponent } from './vendas/visao-geral/visao-geral.component';
import { DashboardComercialComponent } from '../vendas/dashboard-comercial/dashboard-comercial.component';
import { VendasListComponent } from '../vendas/vendas-list/vendas-list.component';
import { ComissoesComponent } from '../financeiro/comissoes/comissoes.component';
import { FinanceiroDreComponent } from '../financeiro/dre/dre.component';
import { FinanceiroFluxoCaixaComponent } from '../financeiro/fluxo-caixa/fluxo-caixa.component';
import { PermissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardHomeComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'dashboard.visualizar' },
  },
  {
    path: 'vendas/dashboard',
    component: DashboardComercialComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'vendas.dashboard.visualizar' },
  },
  {
    path: 'vendas/vendas',
    component: VendasListComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'vendas.vendas.visualizar' },
  },
  {
    path: 'vendas/visao-geral',
    component: VisaoGeralComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'vendas.dashboard.visualizar' },
  },
  {
    path: 'vendas/new',
    component: VendasNewComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'vendas.vendas.criar' },
  },
  {
    path: 'vendas/edit/:id',
    component: VendasNewComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'vendas.vendas.editar' },
  },
  {
    path: 'vendas/corretor',
    component: CorretorComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'vendas.vendas.visualizar' },
  },
  {
    path: 'vendas/corretor/view/:id',
    component: ViewCorretorComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'vendas.vendas.visualizar' },
  },
  {
    path: 'vendas/desistencias',
    component: DesistenciasComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'vendas.cancelamentos.visualizar' },
  },
  {
    path: 'vendas',
    loadChildren: () => import('../vendas/vendas.module').then(m => m.VendasModule),
  },
  {
    path: 'cadastros',
    loadChildren: () => import('../cadastros/cadastros.module').then(m => m.CadastrosModule),
  },
  {
    path: 'credit-analysis/:saleId',
    component: CreditAnalysisComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'comercial.propostas.analisar_credito' },
  },
  {
    path: 'contracts/:saleId',
    component: ContractComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'comercial.contratos.editar' },
  },
  {
    path: 'constructor-transfer/:saleId',
    component: ConstructorTransferComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'financeiro.repasses.editar' },
  },
  {
    path: 'financeiro/centro-custo',
    component: CentroCustoComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'financeiro.centro_custo.visualizar' },
  },
  {
    path: 'financeiro/contas-contabeis',
    component: ContasContabeisComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'financeiro.contas_contabeis.visualizar' },
  },
  {
    path: 'financeiro/contas-pagar',
    component: AccountsPayableComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'financeiro.contas_pagar.visualizar' },
  },
  {
    path: 'financeiro/contas-receber',
    component: AccountsReceivableComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'financeiro.contas_receber.visualizar' },
  },
  {
    path: 'financeiro/dre',
    component: FinanceiroDreComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'financeiro.dre.visualizar' },
  },
  {
    path: 'financeiro/comissoes',
    component: ComissoesComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'financeiro.comissoes.visualizar' },
  },
  {
    path: 'financeiro/fluxo-caixa',
    component: FinanceiroFluxoCaixaComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'financeiro.fluxo_caixa.visualizar' },
  },
  {
    path: 'financeiro/projecao',
    component: ProjecaoComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'financeiro.projecao.visualizar' },
  },
  {
    path: 'rh/controle-funcionarios',
    component: ControleFuncionariosComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'rh.colaboradores.visualizar' },
  },
  {
    path: 'rh/controle-faltas',
    component: ControleFaltasComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'rh.faltas.visualizar' },
  },
  {
    path: 'rh/folha-pagamentos',
    component: FolhaPagamentosComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'rh.folha_pagamentos.visualizar' },
  },
  {
    path: 'rh/ferias',
    component: FeriasComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'rh.ferias.visualizar' },
  },
  {
    path: 'rh/controle-uniforme',
    component: ControleUniformeComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'rh.uniformes.visualizar' },
  },
  {
    path: 'leads',
    redirectTo: 'atendimento/leads/listagem',
    pathMatch: 'full',
  },
  {
    path: 'atendimento/leads/listagem',
    component: LeadsComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.leads.visualizar' },
  },
  {
    path: 'atendimento/leads/andamento',
    redirectTo: 'atendimento/leads/listagem',
    pathMatch: 'full',
  },
  {
    path: 'atendimento/leads/:id',
    component: LeadDetailsComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.leads.visualizar' },
  },
  {
    path: 'atendimento/pos-visita',
    component: PosVisitaComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.posvisita.visualizar' },
  },
  {
    path: 'leads/:id',
    redirectTo: 'atendimento/leads/:id',
    pathMatch: 'full',
  },
  {
    path: 'clientes',
    component: ClientListComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.clientes.visualizar' },
  },
  {
    path: 'settings',
    component: GeraisComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'administracao.gerais.visualizar' },
  },
  {
    path: 'configuracoes/perfis-acessos',
    component: PerfisAcessosComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'administracao.perfis_acessos.visualizar' },
  },
  {
    path: 'construtora',
    component: ConstrutoraComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'cadastros.construtoras.visualizar' },
  },
  {
    path: 'empreendimentos',
    component: CadastroComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'cadastros.empreendimentos.visualizar' },
  },
  {
    path: 'unidades',
    component: EspelhoComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'vendas.unidades.visualizar' },
  },
  {
    path: 'empreendimentos/gerenciar/:id',
    component: AdminEmpreendimentoComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'cadastros.empreendimentos.editar' },
  },
  {
    path: 'visitas',
    component: VisitasComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.visitas.visualizar' },
  },
  {
    path: 'atendimento/agendamento',
    component: VisitasComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.agendamento.visualizar' },
  },
  {
    path: 'atendimento/visitas',
    component: VisitasComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.visitas.visualizar' },
  },
  {
    path: 'atendimento/relatorios',
    component: AtendimentoRelatoriosComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.relatorios.visualizar' },
  },
  {
    path: 'atendimento/gestao',
    component: AtendimentoGestaoComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.gestao.visualizar' },
  },
  {
    path: 'atendimento/distribuicao-leads',
    component: LeadDistributionAgentsComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.gestao.distribuicao_leads.visualizar' },
  },
  {
    path: 'atendimento/regioes-interesse',
    component: LeadInterestRegionsComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.gestao.regioes_interesse.visualizar' },
  },
  {
    path: 'atendimento/fontes-origem',
    component: LeadSourcesComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'atendimento.gestao.fontes_origem.visualizar' },
  },
  {
    path: 'comparecimento',
    component: StandaloneComparecimentosComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: 'rh.comparecimentos.editar' },
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
export class ProjectRoutingModule { }
