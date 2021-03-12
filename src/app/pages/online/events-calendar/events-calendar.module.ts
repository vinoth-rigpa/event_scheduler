import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EventsCalendarPageRoutingModule } from './events-calendar-routing.module';
import { EventsCalendarPage } from './events-calendar.page';
import { NgCalendarModule } from 'ionic2-calendar';
import { EventAddModalPageModule } from '../event-add-modal/event-add-modal.module';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
registerLocaleData(localeEn);
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventsCalendarPageRoutingModule,
    EventAddModalPageModule,
    NgCalendarModule,
  ],
  declarations: [EventsCalendarPage],
  providers: [{ provide: LOCALE_ID, useValue: 'en-EN' }],
})
export class EventsCalendarPageModule {}
