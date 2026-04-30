import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConstrutorasFormComponent } from './construtoras/construtoras-form.component';
import { ConstrutorasListComponent } from './construtoras/construtoras-list.component';
import { EmpreendimentosFormComponent } from './empreendimentos/empreendimentos-form.component';
import { EmpreendimentosListComponent } from './empreendimentos/empreendimentos-list.component';
import { UnidadesFormComponent } from './unidades/unidades-form.component';
import { UnidadesListComponent } from './unidades/unidades-list.component';
import { ClientesFormComponent } from './clientes/clientes-form.component';

const routes: Routes = [
    { path: 'construtoras', component: ConstrutorasListComponent },
    { path: 'construtoras/novo', component: ConstrutorasFormComponent },
    { path: 'construtoras/editar/:id', component: ConstrutorasFormComponent },
    { path: 'empreendimentos', component: EmpreendimentosListComponent },
    { path: 'empreendimentos/novo', component: EmpreendimentosFormComponent },
    { path: 'empreendimentos/editar/:id', component: EmpreendimentosFormComponent },
    { path: 'unidades', component: UnidadesListComponent },
    { path: 'unidades/novo', component: UnidadesFormComponent },
    { path: 'unidades/editar/:id', component: UnidadesFormComponent },
    { path: 'clientes/novo', component: ClientesFormComponent },
    { path: 'clientes/editar/:id', component: ClientesFormComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CadastrosRoutingModule { }
