import { CalendarComponent } from 'ionic2-calendar';
import { Component, ViewChild, OnInit, Inject, LOCALE_ID } from '@angular/core';
import {
  Platform,
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
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: 'app-events-calendar',
  templateUrl: './events-calendar.page.html',
  styleUrls: ['./events-calendar.page.scss'],
})
export class EventsCalendarPage implements OnInit {
  currentPage: string = 'Online EventsCalendarPage';
  device_uuid: any = '';
  device_password: any = '';
  roomName: string = '';
  roomID: string = '';
  eventsData: Event[] = [];
  eventSource = [];
  viewTitle: string;
  eventsList: Event[] = [];
  calendar = { mode: 'month', currentDate: new Date() };
  selectedDate: Date;
  selectedTime: any;
  showEventsList: boolean = false;
  @ViewChild(CalendarComponent) myCal: CalendarComponent;
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  responseData: any;
  constructor(
    public platform: Platform,
    private apiService: ApiService,
    private db: DbService,
    private network: Network,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toast: Toast,
    @Inject(LOCALE_ID) private locale: string,
    private modalCtrl: ModalController,
    private router: Router
  ) {
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    this.roomID = localStorage.getItem('room_id');
    this.roomName = localStorage.getItem('room_name');
  }

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
    this.db.dbState().subscribe((res) => {
      if (res) {
        this.loadEventSources();
      }
    });
  }

  loadEventSources() {
    let currentDateTime = formatDate(
      new Date(),
      'yyyy-MM-dd HH:mm',
      this.locale
    );
    this.db.getEvents(currentDateTime).then((item) => {
      this.eventsData = item;
      this.eventSource = [];
      for (var i = 0; i < this.eventsData.length; i++) {
        this.eventSource.push({
          title: this.eventsData[i].event_name,
          startTime: new Date(this.eventsData[i].start_datetime),
          endTime: new Date(this.eventsData[i].end_datetime),
          allDay: false,
        });
      }
      this.myCal.loadEvents();
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
      this.refreshEventListData(event.selectedTime);
    }
  }

  refreshEventListData(selectedTime) {
    this.selectedTime = formatDate(selectedTime, 'yyyy-MM-dd', this.locale);
    let currentDateTime = formatDate(
      new Date(),
      'yyyy-MM-dd HH:mm',
      this.locale
    );
    this.db.dbState().subscribe((res) => {
      if (res) {
        this.db
          .getEventsByDate(this.selectedTime, currentDateTime)
          .then((item) => {
            this.eventsList = item;
            for (var i = 0; i < this.eventsList.length; i++) {
              this.eventsList[i]['mstart_datetime'] = formatDate(
                this.eventsList[i]['start_datetime'],
                'MMM d, h:mm a',
                this.locale
              );
              this.eventsList[i]['mend_datetime'] = formatDate(
                this.eventsList[i]['end_datetime'],
                'MMM d, h:mm a',
                this.locale
              );
            }
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

  async deleteEventByID(event: Event) {
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
          handler: () => {},
        },
        {
          text: 'Ok',
          handler: async (data: any) => {
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
                  this.deleteEvent(event);
                } else {
                  if (data.password == this.device_password) {
                    this.deleteEvent(event);
                  } else {
                    this.toast
                      .show(AppConfig.INVALID_PASSWORD_MSG, '2000', 'bottom')
                      .subscribe((_) => {});
                  }
                }
              });
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteEvent(event) {
    if (this.networkAvailable) {
      let loader = this.loadingCtrl.create({
        cssClass: 'custom-loader',
        spinner: 'lines-small',
      });
      (await loader).present();

      this.apiService
        .updateEventTable('delete', this.roomName, this.roomID, [
          {
            eventID: event.event_id,
            eventName: event.event_name,
            department: event.dept_name,
            organizer: event.organizer,
            startDateTime: event.start_datetime,
            endDateTime: event.end_datetime,
            password: event.dept_password,
          },
        ])
        .then(
          async (res: any) => {
            if (res?.status == 'success') {
              this.db.deleteEvent(event.id).then(async (res) => {
                this.eventsList = this.eventsList.filter(
                  (item) => item.id !== event.id
                );
                this.toast
                  .show(`Event deleted`, '2000', 'bottom')
                  .subscribe((_) => {});
                this.loadEventSources();
              });
            } else if (res?.status == 'error' || res?.status == 'failure') {
              this.toast
                .show(` ` + res?.reason + ` `, '2000', 'bottom')
                .subscribe((_) => {});
            }
            (await loader).dismiss();
          },
          async (err) => {
            (await loader).dismiss();
            this.toast
              .show(`Server unreachable. Try again later.`, '2000', 'bottom')
              .subscribe((_) => {});
          }
        );
    } else {
      this.toast
        .show(`No internet available`, '2000', 'bottom')
        .subscribe((_) => {});
    }
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
        modal.onDidDismiss().then(async (result) => {
          if (result.data && result.data.isAdded) {
            this.loadEventSources();
          }
        });
      } else {
        this.toast
          .show(`Departments not yet added`, '2000', 'bottom')
          .subscribe((_) => {});
      }
    });
  }

  async openEventEditModal(event: Event) {
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
          handler: () => {},
        },
        {
          text: 'Ok',
          handler: async (data: any) => {
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
                  const modal = await this.modalCtrl.create({
                    component: EventEditModalPage,
                    componentProps: { paramID: event.id },
                    cssClass: 'event-add-modal',
                    backdropDismiss: false,
                  });
                  await modal.present();
                  modal.onDidDismiss().then((result) => {
                    if (result.data && result.data.isAdded) {
                      this.refreshEventListData(this.selectedTime);
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
                      if (result.data && result.data.isAdded) {
                        this.refreshEventListData(this.selectedTime);
                      }
                    });
                  } else {
                    this.toast
                      .show(AppConfig.INVALID_PASSWORD_MSG, '2000', 'bottom')
                      .subscribe((_) => {});
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
    this.router.navigate([`online-dashboard`], { replaceUrl: true });
  }

  isConnected(): boolean {
    let conntype = this.network.type;
    return conntype && conntype !== 'unknown' && conntype !== 'none';
  }

  networkSubscribe() {
    this.network.onDisconnect().subscribe(() => {
      this.networkAvailable = false;
    });
    this.network.onConnect().subscribe(() => {
      this.networkAvailable = true;
    });
  }

  networkUnsubscribe() {
    this.connectSubscription.unsubscribe();
    this.disconnectSubscription.unsubscribe();
  }

  ionViewDidEnter() {
    if (this.isConnected()) {
      this.networkAvailable = true;
    } else {
      this.networkAvailable = false;
    }
    this.networkSubscribe();
    setTimeout(() => {
      this.showEventsList = true;
    }, 1000);
  }
}
