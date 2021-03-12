import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardAvailablePage } from './dashboard-available.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardAvailablePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardAvailablePageRoutingModule {}
