import { Component, AfterViewInit, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import {
  ModalController,
  LoadingController,
  AlertController,
  NavParams,
} from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';
import { DbService } from '../../../services/db/db.service';
import { AppConfig } from '../../../config/appconfig';
import * as moment from 'moment';
@Component({
  selector: 'app-event-extend-modal',
  templateUrl: './event-extend-modal.page.html',
  styleUrls: ['./event-extend-modal.page.scss'],
})
export class EventExtendModalPage implements AfterViewInit {
  device_uuid: any = '';
  device_password: any = '';
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
  constructor(
    private db: DbService,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    @Inject(LOCALE_ID) private locale: string,
    private toast: Toast,
    private navParams: NavParams,
    private modalCtrl: ModalController
  ) {
    AppConfig.consoleLog('EventExtendModalPage constructor');
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    AppConfig.consoleLog('this.device_password', this.device_password);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.modalReady = true;
      AppConfig.consoleLog('event_id', this.navParams.data.paramID);
      this.id = this.navParams.data.paramID;
      AppConfig.consoleLog('event_id 1 ', this.id);
      this.db.dbState().subscribe((res) => {
        if (res) {
          this.db.getEvent(this.id).then((res) => {
            AppConfig.consoleLog('getEvent', res);
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
          AppConfig.consoleLog('currentDateTime', currentDateTime);
          this.db.getNextEvent(currentDateTime).then((item) => {
            if (item) {
              AppConfig.consoleLog('item', item);
              this.nextEventData = item;
            }
          });
        }
      });
    }, 0);
  }
  ngOnInit() {}
  async extend() {
    AppConfig.consoleLog('this.currentEventData', this.currentEventData);
    AppConfig.consoleLog('this.nextEventData', this.nextEventData);
    AppConfig.consoleLog('this.percent', this.percent);
    if (this.percent > 0 && this.currentEventData) {
      if (this.nextEventData) {
        AppConfig.consoleLog(
          'this.currentEventData.end_datetime ',
          new Date(this.currentEventData.end_datetime)
        );
        let currEndDateTime = formatDate(
          this.currentEventData.end_datetime,
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        AppConfig.consoleLog('currEndDateTime ', currEndDateTime);
        var newDateObj = moment(new Date(currEndDateTime))
          .add(this.percent, 'm')
          .toDate();
        AppConfig.consoleLog('start_datetime extend ', newDateObj);
        let endDateTime = formatDate(
          newDateObj,
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        AppConfig.consoleLog('endDateTime ', endDateTime);
        this.currentEventEndTime = formatDate(
          endDateTime,
          'MMM d, h:mm a',
          this.locale
        );
        var eDate = new Date(endDateTime);
        AppConfig.consoleLog(
          'this.nextEventData.start_datetime ',
          new Date(this.nextEventData.start_datetime)
        );
        let nxtStartDateTime = formatDate(
          this.nextEventData.start_datetime,
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        AppConfig.consoleLog('nxtStartDateTime ', nxtStartDateTime);
        var sDate = new Date(nxtStartDateTime);
        AppConfig.consoleLog('sDate ', sDate);
        AppConfig.consoleLog('eDate ', eDate);
        if (eDate >= sDate) {
          this.toast
            .show(`Can't extend beyond next event start time`, '2000', 'bottom')
            .subscribe((_) => {});
        } else {
          this.db
            .extendEventStatus(this.currentEventData?.id, endDateTime)
            .then((res) => {
              AppConfig.consoleLog('extendEventStatus', res);
              this.toast
                .show(
                  `Event extended for another ` + this.percent + ` minitues`,
                  '3000',
                  'bottom'
                )
                .subscribe((_) => {});
              this.modalCtrl.dismiss({ event: res });
            });
        }
      } else {
        let currEndDateTime = formatDate(
          this.currentEventData.end_datetime,
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        AppConfig.consoleLog('currEndDateTime ', currEndDateTime);
        var newDateObj = moment(new Date(currEndDateTime))
          .add(this.percent, 'm')
          .toDate();
        AppConfig.consoleLog('start_datetime extend ', newDateObj);
        let endDateTime = formatDate(
          newDateObj,
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        AppConfig.consoleLog('endDateTime ', endDateTime);
        this.currentEventEndTime = formatDate(
          endDateTime,
          'MMM d, h:mm a',
          this.locale
        );
        this.db
          .extendEventStatus(this.currentEventData?.id, endDateTime)
          .then((res) => {
            AppConfig.consoleLog('extendEventStatus', res);
            this.toast
              .show(
                `Event extended for another ` + this.percent + ` minitues`,
                '3000',
                'bottom'
              )
              .subscribe((_) => {});
            this.modalCtrl.dismiss({ event: res });
          });
      }
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
      AppConfig.consoleLog('currEndDateTime ', currEndDateTime);
      var newDateObj = moment(new Date(currEndDateTime))
        .add(this.percent, 'm')
        .toDate();
      AppConfig.consoleLog('start_datetime extend ', newDateObj);
      let endDateTime = formatDate(newDateObj, 'yyyy-MM-dd HH:mm', this.locale);
      AppConfig.consoleLog('endDateTime ', endDateTime);
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
      AppConfig.consoleLog('currEndDateTime ', currEndDateTime);
      var newDateObj = moment(new Date(currEndDateTime))
        .add(this.percent, 'm')
        .toDate();
      AppConfig.consoleLog('start_datetime extend ', newDateObj);
      let endDateTime = formatDate(newDateObj, 'yyyy-MM-dd HH:mm', this.locale);
      AppConfig.consoleLog('endDateTime ', endDateTime);
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
}
