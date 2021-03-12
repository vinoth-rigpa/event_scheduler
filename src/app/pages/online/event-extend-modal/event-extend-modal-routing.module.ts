import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventExtendModalPage } from './event-extend-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EventExtendModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventExtendModalPageRoutingModule {}
