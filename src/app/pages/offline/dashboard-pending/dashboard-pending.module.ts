import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPendingPageRoutingModule } from './dashboard-pending-routing.module';

import { DashboardPendingPage } from './dashboard-pending.page';
import { EventAddModalPageModule } from '../event-add-modal/event-add-modal.module';
import { EventListModalPageModule } from '../event-list-modal/event-list-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPendingPageRoutingModule,
    EventAddModalPageModule,
    EventListModalPageModule,
  ],
  declarations: [DashboardPendingPage],
})
export class DashboardPendingPageModule {}
