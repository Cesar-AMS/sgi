import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropostasComponent } from '../project/propostas/propostas.component';
import { EspelhoVendasComponent } from './espelho/espelho.component';
import { GerenciamentoUnidadesComponent } from './gerenciamento-unidades/gerenciamento-unidades.component';
import { PermissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
    {
        path: 'espelho',
        component: EspelhoVendasComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'vendas.espelho.visualizar' },
    },
    {
        path: 'gerenciamento-unidades',
        component: GerenciamentoUnidadesComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'vendas.unidades.visualizar' },
    },
    {
        path: 'propostas',
        component: PropostasComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'vendas.propostas.visualizar' },
    },
    { path: 'proposta', redirectTo: 'propostas', pathMatch: 'full' },
    { path: '', redirectTo: 'espelho', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VendasRoutingModule {}
