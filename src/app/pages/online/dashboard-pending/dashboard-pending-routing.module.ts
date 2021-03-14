import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardPendingPage } from './dashboard-pending.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardPendingPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPendingPageRoutingModule {}
