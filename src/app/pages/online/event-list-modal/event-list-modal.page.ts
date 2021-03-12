import { Component, AfterViewInit, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import {
  ModalController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';
import { DbService } from '../../../services/db/db.service';
import { AppConfig } from '../../../config/appconfig';
import { Event } from '../../../models/event';
@Component({
  selector: 'app-event-list-modal',
  templateUrl: './event-list-modal.page.html',
  styleUrls: ['./event-list-modal.page.scss'],
})
export class EventListModalPage implements AfterViewInit {
  device_uuid: any = '';
  device_password: any = '';
  modalReady = false;
  isDeleted = false;
  eventsList: Event[] = [];
  constructor(
    private db: DbService,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    @Inject(LOCALE_ID) private locale: string,
    private toast: Toast,
    private modalCtrl: ModalController
  ) {
    AppConfig.consoleLog('EventAddModalPage constructor');
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    AppConfig.consoleLog('this.device_password', this.device_password);
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
          });
        }
      });
    }, 0);
  }
  ngOnInit() {}
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
                    this.eventsList = this.eventsList.filter(
                      (item) => item.id !== event.id
                    );
                    this.isDeleted = true;
                    this.toast
                      .show(`Event deleted`, '2000', 'bottom')
                      .subscribe((toast) => {
                        console.log(toast);
                      });
                  });
                } else {
                  if (data.password == this.device_password) {
                    this.db.deleteEvent(event.id).then(async (res) => {
                      this.eventsList = this.eventsList.filter(
                        (item) => item.id !== event.id
                      );
                      this.isDeleted = true;
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
  close() {
    this.modalCtrl.dismiss({ isDeleted: this.isDeleted });
  }
}
