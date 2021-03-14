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
  currentPage: string = 'Online EventExtendModalPage';
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
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
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
                  this.db.deleteEvent(event.id).then(async (res) => {
                    this.eventsList = this.eventsList.filter(
                      (item) => item.id !== event.id
                    );
                    this.isDeleted = true;
                    this.toast
                      .show(`Event deleted`, '2000', 'bottom')
                      .subscribe((_) => {});
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
                        .subscribe((_) => {});
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

  close() {
    this.modalCtrl.dismiss({ isDeleted: this.isDeleted });
  }
}
