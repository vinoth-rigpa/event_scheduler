import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventEditModalPage } from './event-edit-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EventEditModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventEditModalPageRoutingModule {}
