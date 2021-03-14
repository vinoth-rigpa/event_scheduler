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
  selector: 'app-event-add-modal',
  templateUrl: './event-add-modal.page.html',
  styleUrls: ['./event-add-modal.page.scss'],
})
export class EventAddModalPage implements AfterViewInit {
  currentPage: string = 'Offline EventAddModalPage';
  device_uuid: any = '';
  device_password: any = '';
  modalReady = false;
  departmentData: Department[] = [];
  eventForm: FormGroup;
  event_id: any;
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
  maxDate: any;
  isIndeterminate: boolean;
  masterCheck: boolean;
  checkBoxList: any;
  isRecurring: boolean;

  constructor(
    private db: DbService,
    public loadingCtrl: LoadingController,
    public formBuilder: FormBuilder,
    @Inject(LOCALE_ID) private locale: string,
    private toast: Toast,
    private modalCtrl: ModalController
  ) {
    this.minDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    this.maxDate = moment().add(1, 'y').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    this.checkBoxList = [
      { number: 0, value: 'Sun', isChecked: false },
      { number: 1, value: 'Mon', isChecked: false },
      { number: 2, value: 'Tue', isChecked: false },
      { number: 3, value: 'Wed', isChecked: false },
      { number: 4, value: 'Thu', isChecked: false },
      { number: 5, value: 'Fri', isChecked: false },
      { number: 6, value: 'Sat', isChecked: false },
    ];
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

  checkMaster() {
    setTimeout(() => {
      this.checkBoxList.forEach((obj) => {
        obj.isChecked = this.masterCheck;
      });
    });
  }

  checkEvent() {
    const totalItems = this.checkBoxList.length;
    let checked = 0;
    this.checkBoxList.map((obj) => {
      if (obj.isChecked) checked++;
    });
    if (checked > 0 && checked < totalItems) {
      this.isIndeterminate = true;
      this.masterCheck = false;
    } else if (checked == totalItems) {
      this.masterCheck = true;
      this.isIndeterminate = false;
    } else {
      this.isIndeterminate = false;
      this.masterCheck = false;
    }
  }

  checkRecurring(event) {
    this.isRecurring = event.detail.checked;
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
        .show(`End time must be greater than Start time.`, '3000', 'bottom')
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
                if (this.isRecurring) {
                  let eTime = formatDate(
                    this.eventForm.value.end_datetime,
                    'HH:mm',
                    this.locale
                  );
                  let sTime = formatDate(
                    this.eventForm.value.start_datetime,
                    'HH:mm',
                    this.locale
                  );
                  let currentDate = formatDate(
                    new Date(),
                    'yyyy-MM-dd',
                    this.locale
                  );
                  let endDate = moment(currentDate).add(60, 'd').toDate();
                  let start = moment(currentDate);
                  let end = moment(endDate);
                  let day = 0;
                  let eventDataArr = [];
                  for (let i = 0; i < this.checkBoxList.length; i++) {
                    if (this.checkBoxList[i].isChecked) {
                      day = this.checkBoxList[i].number;
                      var current = start.clone();
                      if (new Date().getDay() == day) {
                        let eventData = {
                          event_id:
                            start.clone().format('yyyyMMDD') +
                            formatDate(
                              this.eventForm.value.start_datetime,
                              'HHmmss',
                              this.locale
                            ),
                          event_name: this.eventForm.value.event_name,
                          dept_name: this.eventForm.value.dept_name,
                          start_datetime:
                            start.clone().format('yyyy-MM-DD') + ' ' + sTime,
                          end_datetime:
                            start.clone().format('yyyy-MM-DD') + ' ' + eTime,
                          organizer: this.eventForm.value.organizer,
                          dept_password: this.eventForm.value.dept_password,
                        };
                        eventDataArr.push(eventData);
                      }
                      while (current.day(7 + day).isBefore(end)) {
                        let eventData = {
                          event_id:
                            current.clone().format('yyyyMMDD') +
                            formatDate(
                              this.eventForm.value.start_datetime,
                              'HHmmss',
                              this.locale
                            ),
                          event_name: this.eventForm.value.event_name,
                          dept_name: this.eventForm.value.dept_name,
                          start_datetime:
                            current.clone().format('yyyy-MM-DD') + ' ' + sTime,
                          end_datetime:
                            current.clone().format('yyyy-MM-DD') + ' ' + eTime,
                          organizer: this.eventForm.value.organizer,
                          dept_password: this.eventForm.value.dept_password,
                        };
                        eventDataArr.push(eventData);
                      }
                    }
                  }
                  if (eventDataArr.length > 0) {
                    this.modalCtrl.dismiss({ event: eventDataArr });
                  } else {
                    this.modalCtrl.dismiss({ event: [this.eventForm.value] });
                  }
                } else {
                  this.modalCtrl.dismiss({ event: [this.eventForm.value] });
                }
              } else {
                if (
                  this.eventForm.value.dept_password == this.device_password
                ) {
                  localStorage.setItem('popup_open', 'no');
                  if (this.isRecurring) {
                    let eTime = formatDate(
                      this.eventForm.value.end_datetime,
                      'HH:mm',
                      this.locale
                    );
                    let sTime = formatDate(
                      this.eventForm.value.start_datetime,
                      'HH:mm',
                      this.locale
                    );
                    let currentDate = formatDate(
                      new Date(),
                      'yyyy-MM-dd',
                      this.locale
                    );
                    let endDate = moment(currentDate).add(60, 'd').toDate();
                    let start = moment(currentDate);
                    let end = moment(endDate);
                    let day = 0;
                    let eventDataArr = [];
                    for (let i = 0; i < this.checkBoxList.length; i++) {
                      if (this.checkBoxList[i].isChecked) {
                        day = this.checkBoxList[i].number;
                        var current = start.clone();
                        if (new Date().getDay() == day) {
                          let eventData = {
                            event_id:
                              start.clone().format('yyyyMMDD') +
                              formatDate(
                                this.eventForm.value.start_datetime,
                                'HHmmss',
                                this.locale
                              ),
                            event_name: this.eventForm.value.event_name,
                            dept_name: this.eventForm.value.dept_name,
                            start_datetime:
                              start.clone().format('yyyy-MM-DD') + ' ' + sTime,
                            end_datetime:
                              start.clone().format('yyyy-MM-DD') + ' ' + eTime,
                            organizer: this.eventForm.value.organizer,
                            dept_password: this.eventForm.value.dept_password,
                          };
                          eventDataArr.push(eventData);
                        }
                        while (current.day(7 + day).isBefore(end)) {
                          let eventData = {
                            event_id:
                              current.clone().format('yyyyMMDD') +
                              formatDate(
                                this.eventForm.value.start_datetime,
                                'HHmmss',
                                this.locale
                              ),
                            event_name: this.eventForm.value.event_name,
                            dept_name: this.eventForm.value.dept_name,
                            start_datetime:
                              current.clone().format('yyyy-MM-DD') +
                              ' ' +
                              sTime,
                            end_datetime:
                              current.clone().format('yyyy-MM-DD') +
                              ' ' +
                              eTime,
                            organizer: this.eventForm.value.organizer,
                            dept_password: this.eventForm.value.dept_password,
                          };
                          eventDataArr.push(eventData);
                        }
                      }
                    }
                    if (eventDataArr.length > 0) {
                      this.modalCtrl.dismiss({ event: eventDataArr });
                    } else {
                      this.modalCtrl.dismiss({ event: [this.eventForm.value] });
                    }
                  } else {
                    this.modalCtrl.dismiss({ event: [this.eventForm.value] });
                  }
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

  openPopupWindow() {
    localStorage.setItem('popup_open', 'yes');
  }

  close() {
    localStorage.setItem('popup_open', 'no');
    this.modalCtrl.dismiss();
  }
}
