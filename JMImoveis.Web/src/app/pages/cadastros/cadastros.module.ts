import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CadastrosRoutingModule } from './cadastros-routing.module';
import { ConstrutorasListComponent } from './construtoras/construtoras-list.component';
import { ConstrutorasFormComponent } from './construtoras/construtoras-form.component';
import { EmpreendimentosListComponent } from './empreendimentos/empreendimentos-list.component';
import { EmpreendimentosFormComponent } from './empreendimentos/empreendimentos-form.component';
import { UnidadesListComponent } from './unidades/unidades-list.component';
import { UnidadesFormComponent } from './unidades/unidades-form.component';
import { ClientesFormComponent } from './clientes/clientes-form.component';

// Componentes serão adicionados depois
// import { ConstrutorasListComponent } from './construtoras/construtoras-list.component';
// import { ConstrutorasFormComponent } from './construtoras/construtoras-form.component';

@NgModule({
    declarations: [
        ConstrutorasListComponent,
        ConstrutorasFormComponent,
        EmpreendimentosListComponent,
        EmpreendimentosFormComponent,
        UnidadesListComponent,
        UnidadesFormComponent,
        ClientesFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        CadastrosRoutingModule
    ]
})
export class CadastrosModule { }
