import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EventAddModalPageRoutingModule } from './event-add-modal-routing.module';
import { EventAddModalPage } from './event-add-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EventAddModalPageRoutingModule,
  ],
  declarations: [EventAddModalPage],
})
export class EventAddModalPageModule {}
