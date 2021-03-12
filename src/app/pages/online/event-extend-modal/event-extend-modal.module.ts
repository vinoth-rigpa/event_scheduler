import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventExtendModalPageRoutingModule } from './event-extend-modal-routing.module';

import { EventExtendModalPage } from './event-extend-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventExtendModalPageRoutingModule
  ],
  declarations: [EventExtendModalPage]
})
export class EventExtendModalPageModule {}
