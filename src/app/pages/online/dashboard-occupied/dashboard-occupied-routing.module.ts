import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardOccupiedPage } from './dashboard-occupied.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardOccupiedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardOccupiedPageRoutingModule {}
