import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropostasComponent } from '../project/propostas/propostas.component';
import { EspelhoVendasComponent } from './espelho/espelho.component';
import { GerenciamentoUnidadesComponent } from './gerenciamento-unidades/gerenciamento-unidades.component';

const routes: Routes = [
    { path: 'espelho', component: EspelhoVendasComponent },
    { path: 'gerenciamento-unidades', component: GerenciamentoUnidadesComponent },
    { path: 'propostas', component: PropostasComponent },
    { path: 'proposta', redirectTo: 'propostas', pathMatch: 'full' },
    { path: '', redirectTo: 'espelho', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VendasRoutingModule {}
