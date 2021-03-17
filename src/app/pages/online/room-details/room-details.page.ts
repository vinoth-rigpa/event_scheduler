import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Platform, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Toast } from '@ionic-native/toast/ngx';
import { AppConfig } from '../../../config/appconfig';
import { DbService } from '../../../services/db/db.service';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { ApiService } from '../../../services/api/api.service';
import { Event } from '../../../models/event';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.page.html',
  styleUrls: ['./room-details.page.scss'],
})
export class RoomDetailsPage implements OnInit {
  currentPage: string = 'Online RoomDetailsPage';
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  room_details_form: FormGroup;
  responseData: any;
  device_uuid: any;
  validation_messages = {
    room_id: [{ type: 'required', message: 'Enter a valid Room ID' }],
    room_name: [{ type: 'required', message: 'Room Name is required' }],
    room_password: [
      { type: 'required', message: 'Room password is required.' },
    ],
    network_url: [{ type: 'required', message: 'Server URL is required.' }],
  };
  pattern = '^[a-zA-Z0-9]+$';
  eventsData: Event[] = [];

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    private apiService: ApiService,
    @Inject(LOCALE_ID) private locale: string,
    private db: DbService,
    private network: Network,
    private router: Router,
    private toast: Toast,
    public formBuilder: FormBuilder
  ) {
    this.device_uuid = localStorage.getItem('device_uuid');
  }

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
    this.room_details_form = this.formBuilder.group({
      room_id: new FormControl('', [
        Validators.required,
        Validators.pattern(this.pattern),
      ]),
      room_name: new FormControl('', Validators.required),
      room_password: new FormControl('', Validators.required),
      network_url: new FormControl(),
    });
  }

  goPage() {
    this.router.navigate([`online-dashboard`], { replaceUrl: true });
  }

  async storeData() {
    if (this.networkAvailable) {
      let api_url = this.room_details_form.value.network_url;
      if (
        !this.room_details_form.value.network_url.includes('http://') &&
        !this.room_details_form.value.network_url.includes('https://')
      ) {
        api_url = 'http://' + api_url;
      }

      let loader = this.loadingCtrl.create({
        cssClass: 'custom-loader',
        spinner: 'lines-small',
      });
      (await loader).present();

      this.apiService.getTime(api_url).then(
        async (res: any) => {
          localStorage.setItem('api_url', api_url);
          this.apiService
            .registerDeviceConfig(
              this.room_details_form.value.room_name,
              this.room_details_form.value.room_id
            )
            .then(
              async (res: any) => {
                (await loader).dismiss();
                this.db
                  .addRoomDetails(
                    this.device_uuid,
                    this.room_details_form.value.room_id,
                    this.room_details_form.value.room_name,
                    this.room_details_form.value.room_password
                  )
                  .then((res1) => {
                    localStorage.setItem('device_configured', 'yes');
                    localStorage.setItem(
                      'device_password',
                      this.room_details_form.value.room_password
                    );
                    localStorage.setItem(
                      'room_name',
                      this.room_details_form.value.room_name
                    );
                    localStorage.setItem(
                      'room_id',
                      this.room_details_form.value.room_id
                    );
                    this.room_details_form.reset();
                    this.toast
                      .show(`Room details added`, '2000', 'bottom')
                      .subscribe((_) => {});
                    if (res.status == 'success' && res.reason == 'new') {
                      this.db.getAllEvents().then((item) => {
                        this.eventsData = item;
                        if (this.eventsData.length > 0) {
                          let eventInputArr = [];
                          for (var i = 0; i < this.eventsData.length; i++) {
                            let eventInputItem = {
                              eventID: this.eventsData[i].event_id,
                              eventName: this.eventsData[i].event_name,
                              department: this.eventsData[i].dept_name,
                              organizer: this.eventsData[i].organizer,
                              startDateTime: this.eventsData[i].start_datetime,
                              endDateTime: this.eventsData[i].end_datetime,
                              password: this.eventsData[i].dept_password,
                            };
                            eventInputArr.push(eventInputItem);
                          }
                          this.apiService
                            .setEventTable(
                              localStorage.getItem('room_name'),
                              localStorage.getItem('room_id'),
                              eventInputArr
                            )
                            .then(
                              async (res2: any) => {
                                if (res2?.status == 'success') {
                                  this.router.navigate([`online-dashboard`], {
                                    replaceUrl: true,
                                  });
                                }
                              },
                              async (err) => {}
                            );
                        } else {
                          this.router.navigate([`online-dashboard`], {
                            replaceUrl: true,
                          });
                        }
                      });
                    } else if (res.status == 'success' && res.reason == 'old') {
                      this.apiService
                        .getEventTable(
                          localStorage.getItem('room_name'),
                          localStorage.getItem('room_id')
                        )
                        .then(
                          async (res2: any) => {
                            if (res2?.schedule && res2.schedule.length > 0) {
                              for (let i = 0; i < res2.schedule.length; i++) {
                                this.db
                                  .checkEventExistsByID(
                                    res2.schedule[i].eventID
                                  )
                                  .then(async (res3) => {
                                    let eventInputItem = {
                                      id: i,
                                      event_id: res2.schedule[i].eventID,
                                      event_name: res2.schedule[i].eventName,
                                      dept_name: res2.schedule[i].department,
                                      organizer: res2.schedule[i].organizer,
                                      start_datetime:
                                        formatDate(
                                          res2.schedule[i].startDateTime,
                                          'yyyy-MM-dd HH:mm',
                                          this.locale
                                        ) + ':00',
                                      end_datetime:
                                        formatDate(
                                          res2.schedule[i].endDateTime,
                                          'yyyy-MM-dd HH:mm',
                                          this.locale
                                        ) + ':00',
                                      aend_datetime:
                                        formatDate(
                                          res2.schedule[i].endDateTime,
                                          'yyyy-MM-dd HH:mm',
                                          this.locale
                                        ) + ':00',
                                      dept_password: res2.schedule[i].password,
                                      event_status: 0,
                                      sync_status: 1,
                                    };
                                    if (res3) {
                                      this.db
                                        .updateEvent(
                                          res2.schedule[i].eventID,
                                          eventInputItem
                                        )
                                        .then((res4) => {
                                          if (i == res2.schedule.length - 1) {
                                            this.router.navigate(
                                              [`online-dashboard`],
                                              {
                                                replaceUrl: true,
                                              }
                                            );
                                          }
                                        });
                                    } else {
                                      this.db
                                        .addEvent(eventInputItem)
                                        .then((res4) => {
                                          if (i == res2.schedule.length - 1) {
                                            this.router.navigate(
                                              [`online-dashboard`],
                                              {
                                                replaceUrl: true,
                                              }
                                            );
                                          }
                                        });
                                    }
                                  });
                              }
                            } else {
                              this.router.navigate([`online-dashboard`], {
                                replaceUrl: true,
                              });
                            }
                          },
                          async (err) => {}
                        );
                    }
                  });
              },
              async (err) => {
                (await loader).dismiss();
                this.toast
                  .show(`Server Unreachable. Try again Later`, '2000', 'bottom')
                  .subscribe((toast) => {
                    AppConfig.consoleLog(toast);
                  });
              }
            );
        },
        async (err) => {
          (await loader).dismiss();
          this.toast
            .show(`Server URL invalid`, '2000', 'bottom')
            .subscribe((toast) => {
              AppConfig.consoleLog(toast);
            });
        }
      );
    } else {
      const alert = this.alertCtrl.create({
        header: AppConfig.UNKONWN_ERROR_HEADING,
        message: AppConfig.UNKONWN_ERROR,
        buttons: [
          {
            text: 'Ok',
            handler: () => {},
          },
        ],
      });
      (await alert).present();
    }
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
