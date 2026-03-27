import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component
import { AnalyticsComponent } from './analytics/analytics.component';
import { CrmComponent } from './crm/crm.component';
import { IndexComponent } from './index/index.component';
import { LearningComponent } from './learning/learning.component';
import { RealEstateComponent } from './real-estate/real-estate.component';
import { DashboardVendasComponent } from './dashboard-vendas/dashboard-vendas.component';
import { ApresentacaoComponent } from './apresentacao/apresentacao.component';


const routes: Routes = [
  {
    path: "",
    component: DashboardVendasComponent //CrmComponent
  },
  {
    path: "vendas",
    component: DashboardVendasComponent
  },
  {
    path:"apresentacao",
    component: ApresentacaoComponent
  },
  {
    path: "analytics",
    component: AnalyticsComponent
  },
  {
    path: "financial",
    component: CrmComponent
  },
  {
    path: "learning",
    component: LearningComponent
  },
  {
    path: "real-estate",
    component: RealEstateComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule { }
