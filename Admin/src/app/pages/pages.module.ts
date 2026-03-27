import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


// page route
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ProjectModule } from './project/project.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PagesRoutingModule,
    SharedModule,
    ProjectModule
  ]
})
export class PagesModule { }
