import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventListModalPage } from './event-list-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EventListModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventListModalPageRoutingModule {}
