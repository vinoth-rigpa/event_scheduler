import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardOccupiedPageRoutingModule } from './dashboard-occupied-routing.module';

import { DashboardOccupiedPage } from './dashboard-occupied.page';
import { EventAddModalPageModule } from '../event-add-modal/event-add-modal.module';
import { EventListModalPageModule } from '../event-list-modal/event-list-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardOccupiedPageRoutingModule,
    EventAddModalPageModule,
    EventListModalPageModule,
  ],
  declarations: [DashboardOccupiedPage],
})
export class DashboardOccupiedPageModule {}
