import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EventEditModalPageRoutingModule } from './event-edit-modal-routing.module';
import { EventEditModalPage } from './event-edit-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EventEditModalPageRoutingModule,
  ],
  declarations: [EventEditModalPage],
})
export class EventEditModalPageModule {}
