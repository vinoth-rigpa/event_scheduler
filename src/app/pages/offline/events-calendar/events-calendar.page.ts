import { CalendarComponent } from 'ionic2-calendar';
import { Component, ViewChild, OnInit, Inject, LOCALE_ID } from '@angular/core';
import {
  AlertController,
  ModalController,
  LoadingController,
} from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { DbService } from '../../../services/db/db.service';
import { Event } from '../../../models/event';
import { AppConfig } from '../../../config/appconfig';
import { EventAddModalPage } from '../event-add-modal/event-add-modal.page';
import { EventEditModalPage } from '../event-edit-modal/event-edit-modal.page';
import * as moment from 'moment';
@Component({
  selector: 'app-events-calendar',
  templateUrl: './events-calendar.page.html',
  styleUrls: ['./events-calendar.page.scss'],
})
export class EventsCalendarPage implements OnInit {
  device_uuid: any = '';
  device_password: any = '';
  eventsData: Event[] = [];
  eventSource = [];
  viewTitle: string;
  eventsList: Event[] = [];
  calendar = { mode: 'month', currentDate: new Date() };
  selectedDate: Date;
  selectedTime: any;
  showEventsList: boolean = false;
  @ViewChild(CalendarComponent) myCal: CalendarComponent;
  constructor(
    private db: DbService,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toast: Toast,
    @Inject(LOCALE_ID) private locale: string,
    private modalCtrl: ModalController,
    private router: Router
  ) {
    AppConfig.consoleLog('SettingsPage constructor');
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
  }
  ngOnInit() {
    this.db.dbState().subscribe((res) => {
      if (res) {
        let currentDateTime = formatDate(
          new Date(),
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        this.db.getEvents(currentDateTime).then((item) => {
          this.eventsData = item;
          console.log('eventData', this.eventsData);
          for (var i = 0; i < this.eventsData.length; i++) {
            console.log('event', this.eventsData[i]);
            this.eventSource.push({
              title: this.eventsData[i].event_name,
              startTime: new Date(this.eventsData[i].start_datetime),
              endTime: new Date(this.eventsData[i].end_datetime),
              allDay: false,
            });
          }
          console.log('this.eventSource', this.eventSource);
          this.myCal.loadEvents();
        });
      }
    });
  }
  next() {
    this.myCal.slideNext();
  }
  back() {
    this.myCal.slidePrev();
  }
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }
  onTimeSelected(event) {
    if (this.showEventsList) {
      console.log('onTimeSelect ', event);
      this.refreshEventListData(event.selectedTime);
    }
  }
  refreshEventListData(selectedTime) {
    this.selectedTime = formatDate(selectedTime, 'yyyy-MM-dd', this.locale);
    console.log('selectedTime ', this.selectedTime);
    let currentDateTime = formatDate(
      new Date(),
      'yyyy-MM-dd HH:mm',
      this.locale
    );
    console.log('currentDateTime ', currentDateTime);
    this.db.dbState().subscribe((res) => {
      if (res) {
        this.db
          .getEventsByDate(this.selectedTime, currentDateTime)
          .then((item) => {
            this.eventsList = item;
            for (var i = 0; i < this.eventsList.length; i++) {
              this.eventsList[i]['start_datetime'] = formatDate(
                this.eventsList[i]['start_datetime'],
                'MMM d, h:mm a',
                this.locale
              );
              this.eventsList[i]['end_datetime'] = formatDate(
                this.eventsList[i]['end_datetime'],
                'MMM d, h:mm a',
                this.locale
              );
            }
            console.log('eventsList', this.eventsList);
            var eventsListDiv = document.getElementById('eventsList');
            if (this.eventsList.length > 0) {
              eventsListDiv.style.visibility = 'inherit';
              eventsListDiv.style.width = '100%';
              eventsListDiv.style.height = '100%';
            } else {
              eventsListDiv.style.visibility = 'hidden';
              eventsListDiv.style.width = '0';
              eventsListDiv.style.height = '0';
            }
          });
      }
    });
  }
  closeEvent() {
    var eventsListDiv = document.getElementById('eventsList');
    eventsListDiv.style.visibility = 'hidden';
    eventsListDiv.style.width = '0';
    eventsListDiv.style.height = '0';
  }
  ionViewDidEnter() {
    AppConfig.consoleLog('EventsCalendarPage ionViewDidEnter');
    setTimeout(() => {
      this.showEventsList = true;
    }, 1000);
  }
  async deleteEventByID(event: Event) {
    AppConfig.consoleLog('' + event.id);
    const alert = await this.alertCtrl.create({
      cssClass: 'admin-pwd-alert',
      message: 'Are you sure you want to delete?',
      inputs: [
        { name: 'password', type: 'text', placeholder: 'Department Password' },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          },
        },
        {
          text: 'Ok',
          handler: async (data: any) => {
            console.log(
              'Saved Information',
              data.password,
              event.dept_name,
              this.device_password
            );
            let loader = this.loadingCtrl.create({
              cssClass: 'custom-loader',
              spinner: 'lines-small',
            });
            (await loader).present();
            this.db
              .verifyDepartmentPassword(event.dept_name, data.password)
              .then(async (res) => {
                (await loader).dismiss();
                if (res) {
                  console.log('dept_password ', res.dept_password);
                  this.db.deleteEvent(event.id).then(async (res) => {
                    this.eventSource = this.eventSource.filter(
                      (item) =>
                        item.title !== event.event_name &&
                        item.startTime !== new Date(event.start_datetime) &&
                        item.endTime !== new Date(event.end_datetime)
                    );
                    this.eventsList = this.eventsList.filter(
                      (item) => item.id !== event.id
                    );
                    this.toast
                      .show(`Event deleted`, '2000', 'bottom')
                      .subscribe((toast) => {
                        console.log(toast);
                      });
                  });
                } else {
                  if (data.password == this.device_password) {
                    this.db.deleteEvent(event.id).then(async (res) => {
                      this.eventSource = this.eventSource.filter(
                        (item) =>
                          item.title !== event.event_name &&
                          item.startTime !== new Date(event.start_datetime) &&
                          item.endTime !== new Date(event.end_datetime)
                      );
                      this.eventsList = this.eventsList.filter(
                        (item) => item.id !== event.id
                      );
                      this.toast
                        .show(`Event deleted`, '2000', 'bottom')
                        .subscribe((toast) => {
                          console.log(toast);
                        });
                    });
                  } else {
                    this.toast
                      .show(`Invalid password`, '2000', 'bottom')
                      .subscribe((toast) => {
                        console.log(toast);
                      });
                  }
                }
              });
          },
        },
      ],
    });
    await alert.present();
  }
  async onEventSelected(event) {
    let start = formatDate(event.startTime, 'medium', this.locale);
    let end = formatDate(event.endTime, 'medium', this.locale);
    const alert = await this.alertCtrl.create({
      header: event.title,
      subHeader: event.desc,
      message: 'From: ' + start + '<br><br>To: ' + end,
      buttons: ['OK'],
    });
    alert.present();
  }
  async openEventAddModal() {
    this.db.getDepartments().then(async (item) => {
      if (item.length > 0) {
        const modal = await this.modalCtrl.create({
          component: EventAddModalPage,
          cssClass: 'event-add-modal',
          backdropDismiss: false,
        });
        await modal.present();
        modal.onDidDismiss().then((result) => {
          if (result.data && result.data.event) {
            let eventData = result.data.event;
            eventData.forEach((event, index, array) => {
              event.start_datetime = formatDate(
                event.start_datetime,
                'yyyy-MM-dd HH:mm',
                this.locale
              );
              event.end_datetime = formatDate(
                event.end_datetime,
                'yyyy-MM-dd HH:mm',
                this.locale
              );
              this.eventSource.push({
                title: event.event_name,
                startTime: new Date(event.start_datetime),
                endTime: new Date(event.end_datetime),
                allDay: false,
              });
              this.db.addEvent(event).then((res) => {
                console.log('event add ', res);
              });
              if (index === array.length - 1) {
                console.log('event last one');
                this.myCal.loadEvents();
              }
            });
          }
        });
      } else {
        this.toast
          .show(`Departments not yet added`, '2000', 'bottom')
          .subscribe((toast) => {
            console.log(toast);
          });
      }
    });
  }
  async openEventEditModal(event: Event) {
    AppConfig.consoleLog('Event ID =>' + event.id);
    const alert = await this.alertCtrl.create({
      cssClass: 'admin-pwd-alert',
      message: 'Are you sure you want to edit?',
      inputs: [
        { name: 'password', type: 'text', placeholder: 'Department Password' },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          },
        },
        {
          text: 'Ok',
          handler: async (data: any) => {
            console.log(
              'Saved Information',
              data.password,
              event.dept_name,
              this.device_password
            );
            let loader = this.loadingCtrl.create({
              cssClass: 'custom-loader',
              spinner: 'lines-small',
            });
            (await loader).present();
            this.db
              .verifyDepartmentPassword(event.dept_name, data.password)
              .then(async (res) => {
                (await loader).dismiss();
                if (res) {
                  console.log('dept_password ', res.dept_password);
                  const modal = await this.modalCtrl.create({
                    component: EventEditModalPage,
                    componentProps: { paramID: event.id },
                    cssClass: 'event-add-modal',
                    backdropDismiss: false,
                  });
                  await modal.present();
                  modal.onDidDismiss().then((result) => {
                    if (
                      result.data &&
                      result.data.event_id &&
                      result.data.event
                    ) {
                      let event = result.data.event;
                      event.start_datetime = formatDate(
                        event.start_datetime,
                        'yyyy-MM-dd HH:mm',
                        this.locale
                      );
                      event.end_datetime = formatDate(
                        event.end_datetime,
                        'yyyy-MM-dd HH:mm',
                        this.locale
                      );
                      this.db
                        .updateEvent(result.data.event_id, event)
                        .then((res) => {
                          console.log('this.res', res);
                          this.toast
                            .show(`Event details updated`, '2000', 'bottom')
                            .subscribe((toast) => {
                              console.log(toast);
                            });
                          this.refreshEventListData(this.selectedTime);
                        });
                    }
                  });
                } else {
                  if (data.password == this.device_password) {
                    const modal = await this.modalCtrl.create({
                      component: EventEditModalPage,
                      componentProps: { paramID: event.id },
                      cssClass: 'event-add-modal',
                      backdropDismiss: false,
                    });
                    await modal.present();
                    modal.onDidDismiss().then((result) => {
                      if (
                        result.data &&
                        result.data.event_id &&
                        result.data.event
                      ) {
                        let event = result.data.event;
                        event.start_datetime = formatDate(
                          event.start_datetime,
                          'yyyy-MM-dd HH:mm',
                          this.locale
                        );
                        event.end_datetime = formatDate(
                          event.end_datetime,
                          'yyyy-MM-dd HH:mm',
                          this.locale
                        );
                        this.db
                          .updateEvent(result.data.event_id, event)
                          .then((res) => {
                            console.log('this.res', res);
                            this.toast
                              .show(`Event details updated`, '2000', 'bottom')
                              .subscribe((toast) => {
                                console.log(toast);
                              });
                            this.refreshEventListData(this.selectedTime);
                          });
                      }
                    });
                  } else {
                    this.toast
                      .show(`Invalid password`, '2000', 'bottom')
                      .subscribe((toast) => {
                        console.log(toast);
                      });
                  }
                }
              });
          },
        },
      ],
    });
    await alert.present();
  }
  goBack() {
    this.router.navigate([`offline/dashboard`], { replaceUrl: true });
  }
}
