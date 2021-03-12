import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventBookModalPage } from './event-book-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EventBookModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventBookModalPageRoutingModule {}
