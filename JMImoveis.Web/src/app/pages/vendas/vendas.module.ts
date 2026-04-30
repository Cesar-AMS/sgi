import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { PropostasComponent } from '../project/propostas/propostas.component';
import { EspelhoVendasComponent } from './espelho/espelho.component';
import { GerenciamentoUnidadesComponent } from './gerenciamento-unidades/gerenciamento-unidades.component';
import { VendasRoutingModule } from './vendas-routing.module';

@NgModule({
    declarations: [
        EspelhoVendasComponent,
        GerenciamentoUnidadesComponent,
        PropostasComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        VendasRoutingModule
    ]
})
export class VendasModule {}
