import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventsCalendarPage } from './events-calendar.page';

const routes: Routes = [
  {
    path: '',
    component: EventsCalendarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsCalendarPageRoutingModule {}
