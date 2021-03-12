import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoomDetailsPage } from './room-details.page';

const routes: Routes = [
  {
    path: '',
    component: RoomDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomDetailsPageRoutingModule {}
