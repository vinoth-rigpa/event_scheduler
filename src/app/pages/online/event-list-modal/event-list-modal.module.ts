import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventListModalPageRoutingModule } from './event-list-modal-routing.module';

import { EventListModalPage } from './event-list-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventListModalPageRoutingModule
  ],
  declarations: [EventListModalPage]
})
export class EventListModalPageModule {}
