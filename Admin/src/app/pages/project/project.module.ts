import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CountUpModule } from 'ngx-countup';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgStepperModule } from 'angular-ng-stepper';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgxCurrencyDirective } from 'ngx-currency';

import { SharedModule } from 'src/app/shared/shared.module';
import { ProjectRoutingModule } from './project-routing.module';
import { AccountsPayableComponent } from './financeiro/accounts-payable/accounts-payable.component';
import { AccountsReceivableComponent } from './financeiro/accounts-receivable/accounts-receivable.component';
import { ClientListComponent } from './clientes/client-list/client-list.component';
import { GeraisComponent } from './configuracoes/gerais/gerais.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home.component';
import { AdminEmpreendimentoComponent } from './empreendimentos/admin-empreendimento/admin-empreendimento.component';
import { CadastroComponent } from './empreendimentos/cadastro/cadastro.component';
import { EspelhoComponent } from './empreendimentos/espelho/espelho.component';
import { LeadDetailsComponent } from './leads-details/leads-details.component';
import { LeadsComponent } from './leads/leads.component';
import { ModalVendaComponent } from './modal-venda/modal-venda.component';
import { PropostasComponent } from './propostas/propostas.component';
import { VisitasComponent } from './visitas/visitas.component';
import { FluxoCaixaComponent } from './financeiro/fluxo-caixa/fluxo-caixa.component';
import { ProjecaoComponent } from './financeiro/projecao/projecao.component';
import { ControleFuncionariosComponent } from './rh/controle-funcionarios/controle-funcionarios.component';
import { ControleFaltasComponent } from './rh/controle-faltas/controle-faltas.component';
import { ControleUniformeComponent } from './rh/controle-uniforme/controle-uniforme.component';
import { FeriasComponent } from './rh/ferias/ferias.component';
import { FolhaPagamentosComponent } from './rh/folha-pagamentos/folha-pagamentos.component';
import { CorretorComponent } from './vendas/corretor/corretor.component';
import { PropostaComponent } from './vendas/proposta/proposta.component';
import { DesistenciasComponent } from './vendas/desistencias/desistencias.component';
import { VendasNewComponent } from './vendas/vendas-new/vendas-new.component';
import { ViewCorretorComponent } from './vendas/view-corretor/view-corretor.component';
import { VisaoGeralComponent } from './vendas/visao-geral/visao-geral.component';

@NgModule({
  declarations: [
    ViewCorretorComponent,
    DashboardHomeComponent,
    VisitasComponent,
    LeadsComponent,
    LeadDetailsComponent,
    PropostasComponent,
    ClientListComponent,
    PropostaComponent,
    AdminEmpreendimentoComponent,
    GeraisComponent,
    VisaoGeralComponent,
    CadastroComponent,
    EspelhoComponent,
    VendasNewComponent,
    ModalVendaComponent,
    AccountsPayableComponent,
    AccountsReceivableComponent,
    DesistenciasComponent,
    FluxoCaixaComponent,
    ProjecaoComponent,
    ControleFuncionariosComponent,
    ControleFaltasComponent,
    FolhaPagamentosComponent,
    FeriasComponent,
    ControleUniformeComponent,
  ],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    FilterPipeModule,
    SharedModule,
    NgSelectModule,
    BsDatepickerModule,
    TabsModule.forRoot(),
    FlatpickrModule.forRoot(),
    AccordionModule.forRoot(),
    CountUpModule,
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    ProgressbarModule.forRoot(),
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    CdkStepperModule,
    NgStepperModule,
    NgxCurrencyDirective,
    TranslateModule,
    BsDropdownModule.forRoot(),
  ],
  providers: [provideNgxMask()],
  exports: [ModalVendaComponent],
})
export class ProjectModule {}
