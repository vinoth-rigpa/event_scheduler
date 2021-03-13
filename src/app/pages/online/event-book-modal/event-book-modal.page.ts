import { Component, AfterViewInit, Inject, LOCALE_ID } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { formatDate } from '@angular/common';
import { ModalController, LoadingController } from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';
import { Department } from '../../../models/department';
import { DbService } from '../../../services/db/db.service';
import { AppConfig } from '../../../config/appconfig';
import * as moment from 'moment';
@Component({
  selector: 'app-event-book-modal',
  templateUrl: './event-book-modal.page.html',
  styleUrls: ['./event-book-modal.page.scss'],
})
export class EventBookModalPage implements AfterViewInit {
  device_uuid: any = '';
  device_password: any = '';
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
  constructor(
    private db: DbService,
    public loadingCtrl: LoadingController,
    public formBuilder: FormBuilder,
    @Inject(LOCALE_ID) private locale: string,
    private toast: Toast,
    private modalCtrl: ModalController
  ) {
    AppConfig.consoleLog('EventAddModalPage constructor');
    this.minDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    AppConfig.consoleLog('this.minDate', this.minDate);
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    AppConfig.consoleLog('this.device_password', this.device_password);
    this.event_start_date = formatDate(
      new Date(),
      'yyyy-MM-dd HH:mm',
      this.locale
    );
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.modalReady = true;
      localStorage.setItem('popup_open', 'no');
      this.db.dbState().subscribe((res) => {
        if (res) {
          this.db.getDepartments().then((item) => {
            this.departmentData = item;
            AppConfig.consoleLog('departmentData', this.departmentData);
          });
          this.event_id = moment().format('YYYYMMDDHHmmss');
          AppConfig.consoleLog('this.event_id ', this.event_id);
        }
      });
    }, 0);
  }
  ngOnInit() {
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
  checkEventTime($event) {
    AppConfig.consoleLog('event val ', $event.detail.value);
    localStorage.setItem('popup_open', 'no');
    if (
      this.eventForm.value.start_datetime &&
      this.eventForm.value.end_datetime
    ) {
      var eDate = new Date(this.eventForm.value.end_datetime);
      var sDate = new Date(this.eventForm.value.start_datetime);
      AppConfig.consoleLog('sDate ', sDate);
      AppConfig.consoleLog('eDate ', eDate);
      let startDateTime = formatDate(sDate, 'yyyy-MM-dd HH:mm', this.locale);
      AppConfig.consoleLog('startDateTime ', startDateTime);
      let endDateTime = formatDate(eDate, 'yyyy-MM-dd HH:mm', this.locale);
      AppConfig.consoleLog('endDateTime ', endDateTime);
      if (sDate > eDate || startDateTime == endDateTime) {
        this.toast
          .show(`End time must be greater than Start time.`, '3000', 'bottom')
          .subscribe((toast) => {});
      } else {
        this.db
          .checkEventExists(startDateTime, endDateTime)
          .then(async (res) => {
            AppConfig.consoleLog('endDateTime', res);
            if (res) {
              this.toast
                .show(
                  `Event already booked in this time slot.`,
                  '3000',
                  'bottom'
                )
                .subscribe((toast) => {});
            }
          });
      }
    }
  }
  async storeData() {
    AppConfig.consoleLog(this.eventForm.value);
    var eDate = new Date(this.eventForm.value.end_datetime);
    var sDate = new Date(this.eventForm.value.start_datetime);
    AppConfig.consoleLog('sDate ', sDate);
    AppConfig.consoleLog('eDate ', eDate);
    let startDateTime = formatDate(sDate, 'yyyy-MM-dd HH:mm', this.locale);
    AppConfig.consoleLog('startDateTime ', startDateTime);
    let endDateTime = formatDate(eDate, 'yyyy-MM-dd HH:mm', this.locale);
    AppConfig.consoleLog('endDateTime ', endDateTime);
    if (sDate > eDate || startDateTime == endDateTime) {
      this.toast
        .show(`End time must be greater than Start time`, '3000', 'bottom')
        .subscribe((toast) => {});
    } else {
      this.db.checkEventExists(startDateTime, endDateTime).then(async (res) => {
        AppConfig.consoleLog('endDateTime', res);
        if (res) {
          this.toast
            .show(`Event already booked in this time slot.`, '3000', 'bottom')
            .subscribe((toast) => {});
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
                AppConfig.consoleLog('dept_password ', res.dept_password);
                localStorage.setItem('popup_open', 'no');
                this.modalCtrl.dismiss({ event: this.eventForm.value });
              } else {
                if (
                  this.eventForm.value.dept_password == this.device_password
                ) {
                  localStorage.setItem('popup_open', 'no');
                  this.modalCtrl.dismiss({ event: this.eventForm.value });
                } else {
                  this.toast
                    .show(`Invalid password`, '2000', 'bottom')
                    .subscribe((toast) => {});
                }
              }
            });
        }
      });
    }
  }
  openPopupWindow() {
    localStorage.setItem('popup_open', 'yes');
  }
  close() {
    localStorage.setItem('popup_open', 'no');
    this.modalCtrl.dismiss();
  }
}
