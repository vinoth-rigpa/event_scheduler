import { Component, AfterViewInit, Inject, LOCALE_ID } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { formatDate } from '@angular/common';
import {
  Platform,
  ModalController,
  LoadingController,
  NavParams,
} from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';
import { Department } from '../../../models/department';
import { DbService } from '../../../services/db/db.service';
import { AppConfig } from '../../../config/appconfig';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: 'app-event-edit-modal',
  templateUrl: './event-edit-modal.page.html',
  styleUrls: ['./event-edit-modal.page.scss'],
})
export class EventEditModalPage implements AfterViewInit {
  currentPage: string = 'Online EventEditModalPage';
  device_uuid: any = '';
  device_password: any = '';
  roomName: string = '';
  roomID: string = '';
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
  maxDate: any;
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
    private navParams: NavParams,
    private modalCtrl: ModalController,
    public platform: Platform,
    private network: Network,
    private apiService: ApiService
  ) {
    this.minDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    this.maxDate = moment().add(1, 'y').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    this.roomID = localStorage.getItem('room_id');
    this.roomName = localStorage.getItem('room_name');
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
                  this.editEvent();
                } else {
                  if (
                    this.eventForm.value.dept_password == this.device_password
                  ) {
                    localStorage.setItem('popup_open', 'no');
                    this.editEvent();
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

  async editEvent() {
    let eventDataArr = [];
    eventDataArr.push(this.eventForm.value);

    if (eventDataArr.length > 0) {
      let eventData = eventDataArr;
      let eventInputArr = [];
      eventData.forEach((event, index, array) => {
        event.start_datetime =
          formatDate(event.start_datetime, 'yyyy-MM-dd HH:mm', this.locale) +
          ':00';
        event.end_datetime =
          formatDate(event.end_datetime, 'yyyy-MM-dd HH:mm', this.locale) +
          ':00';

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
      });

      AppConfig.consoleLog('eventInputArr', eventInputArr);

      if (this.networkAvailable) {
        let loader = this.loadingCtrl.create({
          cssClass: 'custom-loader',
          spinner: 'lines-small',
        });
        (await loader).present();

        this.apiService
          .updateEventTable('edit', this.roomName, this.roomID, eventInputArr)
          .then(
            async (res: any) => {
              if (res?.status == 'success') {
                eventData.forEach((event, index, array) => {
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
                  this.db.updateEvent(this.id, event).then((res) => {
                    this.toast
                      .show(`Event details updated`, '2000', 'bottom')
                      .subscribe((_) => {});
                  });

                  if (index === array.length - 1) {
                    AppConfig.consoleLog('add event - last index');
                    this.isAdded = true;
                    this.modalCtrl.dismiss({ isAdded: this.isAdded });
                  }
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
  }

  openPopupWindow() {
    localStorage.setItem('popup_open', 'yes');
  }

  close() {
    localStorage.setItem('popup_open', 'no');
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
      AppConfig.consoleLog('Network available');
    } else {
      this.networkAvailable = false;
      AppConfig.consoleLog('Network unavailable');
    }
    this.networkSubscribe();
  }
}
