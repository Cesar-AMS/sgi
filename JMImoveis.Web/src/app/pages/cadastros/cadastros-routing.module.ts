import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConstrutorasFormComponent } from './construtoras/construtoras-form.component';
import { ConstrutorasListComponent } from './construtoras/construtoras-list.component';
import { EmpreendimentosFormComponent } from './empreendimentos/empreendimentos-form.component';
import { EmpreendimentosListComponent } from './empreendimentos/empreendimentos-list.component';
import { UnidadesFormComponent } from './unidades/unidades-form.component';
import { UnidadesListComponent } from './unidades/unidades-list.component';
import { ClientesFormComponent } from './clientes/clientes-form.component';
import { PermissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
    {
        path: 'construtoras',
        component: ConstrutorasListComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'cadastros.construtoras.visualizar' },
    },
    {
        path: 'construtoras/novo',
        component: ConstrutorasFormComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'cadastros.construtoras.criar' },
    },
    {
        path: 'construtoras/editar/:id',
        component: ConstrutorasFormComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'cadastros.construtoras.editar' },
    },
    {
        path: 'empreendimentos',
        component: EmpreendimentosListComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'cadastros.empreendimentos.visualizar' },
    },
    {
        path: 'empreendimentos/novo',
        component: EmpreendimentosFormComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'cadastros.empreendimentos.criar' },
    },
    {
        path: 'empreendimentos/editar/:id',
        component: EmpreendimentosFormComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'cadastros.empreendimentos.editar' },
    },
    {
        path: 'unidades',
        component: UnidadesListComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'cadastros.unidades.visualizar' },
    },
    {
        path: 'unidades/novo',
        component: UnidadesFormComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'cadastros.unidades.criar' },
    },
    {
        path: 'unidades/editar/:id',
        component: UnidadesFormComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'cadastros.unidades.editar' },
    },
    {
        path: 'clientes/novo',
        component: ClientesFormComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'atendimento.clientes.criar' },
    },
    {
        path: 'clientes/editar/:id',
        component: ClientesFormComponent,
        canActivate: [PermissionGuard],
        data: { permissionKey: 'atendimento.clientes.editar' },
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CadastrosRoutingModule { }
