import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DashboardAvailablePageRoutingModule } from './dashboard-available-routing.module';
import { DashboardAvailablePage } from './dashboard-available.page';
import { EventAddModalPageModule } from '../event-add-modal/event-add-modal.module';
import { EventListModalPageModule } from '../event-list-modal/event-list-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardAvailablePageRoutingModule,
    EventAddModalPageModule,
    EventListModalPageModule,
  ],
  declarations: [DashboardAvailablePage],
})
export class DashboardAvailablePageModule {}
