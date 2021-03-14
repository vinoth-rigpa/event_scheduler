import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventAddModalPage } from './event-add-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EventAddModalPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventAddModalPageRoutingModule {}
