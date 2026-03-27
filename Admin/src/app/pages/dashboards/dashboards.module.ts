import { NgModule, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Page route
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

// Simplebar
import { SimplebarAngularModule } from 'simplebar-angular';

// Count To
import { CountUpModule } from 'ngx-countup';

// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';

// Apex Chart Package
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// Leaflet map
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import localePt from '@angular/common/locales/pt';
// component
import { AnalyticsComponent } from './analytics/analytics.component';
import { CrmComponent } from './crm/crm.component';
import { IndexComponent } from './index/index.component';
import { LearningComponent } from './learning/learning.component';
import { RealEstateComponent } from './real-estate/real-estate.component';
import { ApresentacaoComponent } from './apresentacao/apresentacao.component';

registerLocaleData(localePt, 'pt-BR'); // carrega dados do locale

@NgModule({
  declarations: [
    AnalyticsComponent,
    CrmComponent,
    ApresentacaoComponent,
    IndexComponent,
    LearningComponent,
    RealEstateComponent
  ],
  imports: [
    CommonModule,
    DashboardsRoutingModule,
    SharedModule,
    BsDropdownModule,
    CountUpModule,
    NgApexchartsModule,
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    SimplebarAngularModule,
    ProgressbarModule.forRoot(),
    LeafletModule,
    NgxEchartsModule.forRoot({ echarts }),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    FlatpickrModule.forRoot()
  ],
   providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' } // define o locale padrão
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardsModule { }
