import { Component, AfterViewInit, Inject, LOCALE_ID } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { formatDate } from '@angular/common';
import { ModalController, LoadingController, NavParams } from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';
import { Department } from '../../../models/department';
import { DbService } from '../../../services/db/db.service';
import { AppConfig } from '../../../config/appconfig';
import * as moment from 'moment';

@Component({
  selector: 'app-event-edit-modal',
  templateUrl: './event-edit-modal.page.html',
  styleUrls: ['./event-edit-modal.page.scss'],
})
export class EventEditModalPage implements AfterViewInit {
  currentPage: string = 'Offline EventEditModalPage';
  device_uuid: any = '';
  device_password: any = '';
  modalReady = false;
  departmentData: Department[] = [];
  eventForm: FormGroup;
  id: any;
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
    private navParams: NavParams,
    private modalCtrl: ModalController
  ) {
    this.minDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
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
      this.id = this.navParams.data.paramID;
      this.db.dbState().subscribe((res) => {
        if (res) {
          this.db.getDepartments().then((item) => {
            this.departmentData = item;
            this.db.getEvent(this.id).then((res) => {
              this.eventForm.setValue({
                event_id: res['event_id'],
                event_name: res['event_name'],
                dept_name: res['dept_name'],
                start_datetime: res['start_datetime'],
                end_datetime: res['end_datetime'],
                organizer: res['organizer'],
                dept_password: res['dept_password'],
              });
            });
          });
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
          .checkEventExistsonEdit(
            this.eventForm.value.event_id,
            startDateTime,
            endDateTime
          )
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
      this.db
        .checkEventExistsonEdit(
          this.eventForm.value.event_id,
          startDateTime,
          endDateTime
        )
        .then(async (res) => {
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
                  this.modalCtrl.dismiss({
                    event_id: this.id,
                    event: this.eventForm.value,
                  });
                } else {
                  if (
                    this.eventForm.value.dept_password == this.device_password
                  ) {
                    localStorage.setItem('popup_open', 'no');
                    this.modalCtrl.dismiss({
                      event_id: this.id,
                      event: this.eventForm.value,
                    });
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
