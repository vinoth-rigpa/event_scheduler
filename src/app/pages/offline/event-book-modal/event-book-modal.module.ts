import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EventBookModalPageRoutingModule } from './event-book-modal-routing.module';
import { EventBookModalPage } from './event-book-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EventBookModalPageRoutingModule,
  ],
  declarations: [EventBookModalPage],
})
export class EventBookModalPageModule {}
