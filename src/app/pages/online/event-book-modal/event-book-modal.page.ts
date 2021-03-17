import { Component, AfterViewInit, Inject, LOCALE_ID } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { formatDate } from '@angular/common';
import { Platform, ModalController, LoadingController } from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';
import { Department } from '../../../models/department';
import { DbService } from '../../../services/db/db.service';
import { AppConfig } from '../../../config/appconfig';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: 'app-event-book-modal',
  templateUrl: './event-book-modal.page.html',
  styleUrls: ['./event-book-modal.page.scss'],
})
export class EventBookModalPage implements AfterViewInit {
  currentPage: string = 'Online EventBookModalPage';
  device_uuid: any = '';
  device_password: any = '';
  roomName: string = '';
  roomID: string = '';
  modalReady = false;
  departmentData: Department[] = [];
  eventForm: FormGroup;
  event_id: any;
  event_start_date: any;
  validation_messages = {
    event_id: [{ type: 'required', message: 'Event ID is required.' }],
    event_name: [{ type: 'required', message: 'Event name is required.' }],
    dept_name: [{ type: 'required', message: 'Department is required.' }],
    start_datetime: [{ type: 'required', message: 'Start time is required.' }],
    end_datetime: [{ type: 'required', message: 'End time is required.' }],
    organizer: [{ type: 'required', message: 'Organizer name is required.' }],
    dept_password: [{ type: 'required', message: 'Password is required.' }],
  };
  minDate: any;
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  responseData: any;
  isAdded = false;

  constructor(
    private db: DbService,
    public loadingCtrl: LoadingController,
    public formBuilder: FormBuilder,
    @Inject(LOCALE_ID) private locale: string,
    private toast: Toast,
    private modalCtrl: ModalController,
    public platform: Platform,
    private network: Network,
    private apiService: ApiService
  ) {
    this.minDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    this.roomID = localStorage.getItem('room_id');
    this.roomName = localStorage.getItem('room_name');
    this.event_start_date = formatDate(
      new Date(),
      'yyyy-MM-dd HH:mm',
      this.locale
    );
  }

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
    this.eventForm = this.formBuilder.group({
      event_id: new FormControl('', Validators.required),
      event_name: new FormControl('', Validators.required),
      dept_name: new FormControl('', Validators.required),
      start_datetime: new FormControl('', Validators.required),
      end_datetime: new FormControl('', Validators.required),
      organizer: new FormControl('', Validators.required),
      dept_password: new FormControl('', Validators.required),
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.modalReady = true;
      localStorage.setItem('popup_open', 'no');
      this.db.dbState().subscribe((res) => {
        if (res) {
          this.db.getDepartments().then((item) => {
            this.departmentData = item;
          });
          this.event_id = moment().format('YYYYMMDDHHmmss');
        }
      });
    }, 0);
  }

  checkEventTime($event) {
    localStorage.setItem('popup_open', 'no');
    if (
      this.eventForm.value.start_datetime &&
      this.eventForm.value.end_datetime
    ) {
      var eDate = new Date(this.eventForm.value.end_datetime);
      var sDate = new Date(this.eventForm.value.start_datetime);
      let startDateTime = formatDate(sDate, 'yyyy-MM-dd HH:mm', this.locale);
      let endDateTime = formatDate(eDate, 'yyyy-MM-dd HH:mm', this.locale);
      if (sDate > eDate || startDateTime == endDateTime) {
        this.toast
          .show(`End time must be greater than Start time.`, '3000', 'bottom')
          .subscribe((_) => {});
      } else {
        this.db
          .checkEventExists(startDateTime, endDateTime)
          .then(async (res) => {
            if (res) {
              this.toast
                .show(
                  `Event already booked in this time slot.`,
                  '3000',
                  'bottom'
                )
                .subscribe((_) => {});
            }
          });
      }
    }
  }

  async storeData() {
    var eDate = new Date(this.eventForm.value.end_datetime);
    var sDate = new Date(this.eventForm.value.start_datetime);
    let startDateTime = formatDate(sDate, 'yyyy-MM-dd HH:mm', this.locale);
    let endDateTime = formatDate(eDate, 'yyyy-MM-dd HH:mm', this.locale);
    if (sDate > eDate || startDateTime == endDateTime) {
      this.toast
        .show(`End time must be greater than Start time`, '3000', 'bottom')
        .subscribe((_) => {});
    } else {
      this.db.checkEventExists(startDateTime, endDateTime).then(async (res) => {
        if (res) {
          this.toast
            .show(`Event already booked in this time slot.`, '3000', 'bottom')
            .subscribe((_) => {});
        } else {
          let loader = this.loadingCtrl.create({
            cssClass: 'custom-loader',
            spinner: 'lines-small',
          });
          (await loader).present();
          this.db
            .verifyDepartmentPassword(
              this.eventForm.value.dept_name,
              this.eventForm.value.dept_password
            )
            .then(async (res) => {
              (await loader).dismiss();
              if (res) {
                localStorage.setItem('popup_open', 'no');
                this.bookEvent();
              } else {
                if (
                  this.eventForm.value.dept_password == this.device_password
                ) {
                  localStorage.setItem('popup_open', 'no');
                  this.bookEvent();
                } else {
                  this.toast
                    .show(AppConfig.INVALID_PASSWORD_MSG, '2000', 'bottom')
                    .subscribe((_) => {});
                }
              }
            });
        }
      });
    }
  }

  async bookEvent() {
    let event = this.eventForm.value;

    let eventInputArr = [];
    event.start_datetime =
      formatDate(event.start_datetime, 'yyyy-MM-dd HH:mm', this.locale) + ':00';
    event.end_datetime =
      formatDate(event.end_datetime, 'yyyy-MM-dd HH:mm', this.locale) + ':00';

    let eventInputItem = {
      eventID: event.event_id,
      eventName: event.event_name,
      department: event.dept_name,
      organizer: event.organizer,
      startDateTime: event.start_datetime,
      endDateTime: event.end_datetime,
      password: event.dept_password,
    };

    eventInputArr.push(eventInputItem);
    AppConfig.consoleLog('eventInputArr', eventInputArr);

    if (this.networkAvailable) {
      let loader = this.loadingCtrl.create({
        cssClass: 'custom-loader',
        spinner: 'lines-small',
      });
      (await loader).present();

      this.apiService
        .setEventTable(this.roomName, this.roomID, eventInputArr)
        .then(
          async (res: any) => {
            if (res?.status == 'success') {
              event.start_datetime =
                formatDate(
                  event.start_datetime,
                  'yyyy-MM-dd HH:mm',
                  this.locale
                ) + ':00';
              event.end_datetime =
                formatDate(
                  event.end_datetime,
                  'yyyy-MM-dd HH:mm',
                  this.locale
                ) + ':00';
              this.db.bookEvent(event).then((res) => {
                this.isAdded = true;
                this.modalCtrl.dismiss({ isAdded: this.isAdded });
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

  openPopupWindow() {
    localStorage.setItem('popup_open', 'yes');
  }

  close() {
    localStorage.setItem('popup_open', 'no');
    this.modalCtrl.dismiss({ isAdded: this.isAdded });
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
      AppConfig.consoleLog('Network available');
    } else {
      this.networkAvailable = false;
      AppConfig.consoleLog('Network unavailable');
    }
    this.networkSubscribe();
  }
}
