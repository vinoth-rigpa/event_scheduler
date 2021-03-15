import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EventExtendModalPageRoutingModule } from './event-extend-modal-routing.module';
import { EventExtendModalPage } from './event-extend-modal.page';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventExtendModalPageRoutingModule,
    NgCircleProgressModule.forRoot({
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#263674',
      innerStrokeColor: '#9ba6c9',
      animationDuration: 300,
    }),
  ],
  declarations: [EventExtendModalPage],
})
export class EventExtendModalPageModule {}
