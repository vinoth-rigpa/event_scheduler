import { Component, AfterViewInit, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import {
  Platform,
  ModalController,
  LoadingController,
  NavParams,
} from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';
import { DbService } from '../../../services/db/db.service';
import { AppConfig } from '../../../config/appconfig';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: 'app-event-extend-modal',
  templateUrl: './event-extend-modal.page.html',
  styleUrls: ['./event-extend-modal.page.scss'],
})
export class EventExtendModalPage implements AfterViewInit {
  currentPage: string = 'Online EventExtendModalPage';
  device_uuid: any = '';
  device_password: any = '';
  roomName: string = '';
  roomID: string = '';
  modalReady = false;
  percent: any = 0;
  radius: any = 100;
  maxPercent: any = 100;
  subtitle: any = 'Minitues';
  id: any;
  currentEventData: any;
  nextEventData: any;
  currentEventStartTime: any;
  currentEventEndTime: any;
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
    @Inject(LOCALE_ID) private locale: string,
    private toast: Toast,
    private navParams: NavParams,
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
      this.id = this.navParams.data.paramID;
      this.db.dbState().subscribe((res) => {
        if (res) {
          this.db.getEvent(this.id).then((res) => {
            if (res) {
              this.currentEventData = res;
              this.currentEventStartTime = formatDate(
                this.currentEventData.start_datetime,
                'MMM d, h:mm a',
                this.locale
              );
              this.currentEventEndTime = formatDate(
                this.currentEventData.end_datetime,
                'MMM d, h:mm a',
                this.locale
              );
            }
          });
          let currentDateTime = formatDate(
            new Date(),
            'yyyy-MM-dd HH:mm',
            this.locale
          );
          this.subtitle = 'Minitues';
          this.db.getNextEvent(currentDateTime).then((item) => {
            if (item) {
              this.nextEventData = item;
            }
          });
        }
      });
    }, 0);
  }

  async extend() {
    if (this.percent > 0 && this.currentEventData) {
      if (this.nextEventData) {
        let currEndDateTime = formatDate(
          this.currentEventData.end_datetime,
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        var newDateObj = moment(new Date(currEndDateTime))
          .add(this.percent, 'm')
          .toDate();
        let endDateTime = formatDate(
          newDateObj,
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        this.currentEventEndTime = formatDate(
          endDateTime,
          'MMM d, h:mm a',
          this.locale
        );
        var eDate = new Date(endDateTime);
        let nxtStartDateTime = formatDate(
          this.nextEventData.start_datetime,
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        var sDate = new Date(nxtStartDateTime);
        if (eDate >= sDate) {
          this.toast
            .show(`Can't extend beyond next event start time`, '2000', 'bottom')
            .subscribe((_) => {});
        } else {
          this.extendEvent(endDateTime);
        }
      } else {
        let currEndDateTime = formatDate(
          this.currentEventData.end_datetime,
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        var newDateObj = moment(new Date(currEndDateTime))
          .add(this.percent, 'm')
          .toDate();
        let endDateTime = formatDate(
          newDateObj,
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        this.currentEventEndTime = formatDate(
          endDateTime,
          'MMM d, h:mm a',
          this.locale
        );
        this.extendEvent(endDateTime);
      }
    }
  }

  async extendEvent(endDateTime) {
    if (this.networkAvailable) {
      let loader = this.loadingCtrl.create({
        cssClass: 'custom-loader',
        spinner: 'lines-small',
      });
      (await loader).present();

      this.apiService
        .updateEventTable('extend', this.roomName, this.roomID, [
          {
            eventID: this.currentEventData?.event_id,
            eventName: this.currentEventData?.event_name,
            department: this.currentEventData?.dept_name,
            organizer: this.currentEventData?.organizer,
            startDateTime: this.currentEventData?.start_datetime,
            endDateTime: endDateTime + ':00',
            password: this.currentEventData?.dept_password,
          },
        ])
        .then(
          async (res: any) => {
            if (res?.status == 'success') {
              this.db
                .extendEventStatus(this.currentEventData?.id, endDateTime)
                .then((res) => {
                  this.toast
                    .show(
                      `Event extended for another ` +
                        this.percent +
                        ` minitues`,
                      '3000',
                      'bottom'
                    )
                    .subscribe((_) => {});
                  this.modalCtrl.dismiss({ event: res });
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

  minusTime() {
    if (this.percent >= 5) {
      this.percent = this.percent - 5;
      let currEndDateTime = formatDate(
        this.currentEventData.end_datetime,
        'yyyy-MM-dd HH:mm',
        this.locale
      );
      var newDateObj = moment(new Date(currEndDateTime))
        .add(this.percent, 'm')
        .toDate();
      let endDateTime = formatDate(newDateObj, 'yyyy-MM-dd HH:mm', this.locale);
      this.currentEventEndTime = formatDate(
        endDateTime,
        'MMM d, h:mm a',
        this.locale
      );
    }
  }

  addTime() {
    if (this.percent < this.maxPercent) {
      this.percent = this.percent + 5;
      let currEndDateTime = formatDate(
        this.currentEventData.end_datetime,
        'yyyy-MM-dd HH:mm',
        this.locale
      );
      var newDateObj = moment(new Date(currEndDateTime))
        .add(this.percent, 'm')
        .toDate();
      let endDateTime = formatDate(newDateObj, 'yyyy-MM-dd HH:mm', this.locale);
      this.currentEventEndTime = formatDate(
        endDateTime,
        'MMM d, h:mm a',
        this.locale
      );
    }
  }

  close() {
    this.modalCtrl.dismiss();
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
