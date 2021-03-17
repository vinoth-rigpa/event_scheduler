import { Component, AfterViewInit, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import {
  Platform,
  ModalController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';
import { DbService } from '../../../services/db/db.service';
import { AppConfig } from '../../../config/appconfig';
import { Event } from '../../../models/event';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: 'app-event-list-modal',
  templateUrl: './event-list-modal.page.html',
  styleUrls: ['./event-list-modal.page.scss'],
})
export class EventListModalPage implements AfterViewInit {
  currentPage: string = 'Online EventExtendModalPage';
  device_uuid: any = '';
  device_password: any = '';
  roomName: string = '';
  roomID: string = '';
  modalReady = false;
  isDeleted = false;
  eventsList: Event[] = [];
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
    @Inject(LOCALE_ID) private locale: string,
    private toast: Toast,
    private modalCtrl: ModalController
  ) {
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    this.roomID = localStorage.getItem('room_id');
    this.roomName = localStorage.getItem('room_name');
  }

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.modalReady = true;
      this.db.dbState().subscribe((res) => {
        if (res) {
          let currentDateTime = formatDate(
            new Date(),
            'yyyy-MM-dd HH:mm',
            this.locale
          );
          this.db.getUpcomingEventsByDate(currentDateTime).then((item) => {
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
          });
        }
      });
    }, 0);
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
                this.isDeleted = true;
                this.toast
                  .show(`Event deleted`, '2000', 'bottom')
                  .subscribe((_) => {});
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

  close() {
    this.modalCtrl.dismiss({ isDeleted: this.isDeleted });
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
  }
}
