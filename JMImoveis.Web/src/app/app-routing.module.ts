import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthlayoutComponent } from './authlayout/authlayout.component';
import { LayoutComponent } from './layouts/layout.component';

const routes: Routes = [
  {
    path: 'vendas',
    redirectTo: 'jm/vendas',
    pathMatch: 'full'
  },
  {
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule)
  },
  {
    path: '',
    component: AuthlayoutComponent,
    loadChildren: () => import('./account/account.module').then((m) => m.AccountModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
