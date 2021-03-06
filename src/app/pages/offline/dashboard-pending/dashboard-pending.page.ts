import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { AppConfig } from '../../../config/appconfig';
import { DbService } from '../../../services/db/db.service';
import {
  AlertController,
  ModalController,
  LoadingController,
  IonSlides,
} from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';
import { Event } from '../../../models/event';
import { EventAddModalPage } from '../event-add-modal/event-add-modal.page';
import { EventListModalPage } from '../event-list-modal/event-list-modal.page';
import { EventBookModalPage } from '../event-book-modal/event-book-modal.page';
import { EventExtendModalPage } from '../event-extend-modal/event-extend-modal.page';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-dashboard-pending',
  templateUrl: './dashboard-pending.page.html',
  styleUrls: ['./dashboard-pending.page.scss'],
})
export class DashboardPendingPage implements OnInit {
  currentPage: string = 'Offline DashboardPendingPage';
  device_uuid: any = '';
  device_password: any = '';
  roomName: string = '';
  today = new Date().toLocaleTimeString();
  todayTime = '';
  todayTimeTxt = '';
  todayDateTxt = '';
  todayDate: any;
  event_status: any = '-';
  upcomingEventsList: Event[] = [];
  currentEventData: Event;
  intervalTimer: any;
  intervalRefreshData: any;
  sliderTitle: any = '';
  @ViewChild('slides', { static: true }) slides: IonSlides;
  logoImg: any = '/assets/imgs/logo_transparent.png';

  constructor(
    public alertController: AlertController,
    private modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    @Inject(LOCALE_ID) private locale: string,
    private db: DbService,
    private router: Router,
    private toast: Toast,
    private storage: Storage,
    private ref: ChangeDetectorRef
  ) {
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    this.startTime();
    this.getLogo();
    this.todayDate = formatDate(new Date(), 'MMM d, yyyy', this.locale);
    this.todayDateTxt = formatDate(new Date(), 'MMM d', this.locale);
  }

  getLogo() {
    this.storage.get(AppConfig.LOGO_STORAGE_KEY).then((image) => {
      AppConfig.consoleLog('LOGO_STORAGE_KEY', image);
      if (image) {
        this.logoImg = image;
        let header_logo = document.getElementsByClassName('header-logo-holder');
        for (let i = 0; i < header_logo.length; ++i) {
          let item = header_logo[i];
          item.setAttribute(
            'style',
            "background-image:url('" + this.logoImg + "');"
          );
        }
      } else {
        let header_logo = document.getElementsByClassName('header-logo-holder');
        for (let i = 0; i < header_logo.length; ++i) {
          let item = header_logo[i];
          item.setAttribute(
            'style',
            "background-image:url('" + this.logoImg + "');"
          );
        }
      }
      this.ref.detectChanges();
    });
  }

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
    this.db.dbState().subscribe((res) => {
      if (res) {
        this.db.getRoomDetail(this.device_uuid).then((res) => {
          this.roomName = this.truncate(res['room_name']);
        });
        let currentDateTime = formatDate(
          new Date(),
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        this.db.getEventStatus(currentDateTime).then((res) => {
          AppConfig.consoleLog('check Event Status', res);
          if (res) {
            this.currentEventData = res;
            this.currentEventData.start_datetime = formatDate(
              this.currentEventData.start_datetime,
              'MMM d, h:mm a',
              this.locale
            );
            this.currentEventData.end_datetime = formatDate(
              this.currentEventData.end_datetime,
              'MMM d, h:mm a',
              this.locale
            );
            if (res['event_status'] == 0) {
              this.event_status = 'PENDING';
              this.uiChanges(currentDateTime);
            } else if (res['event_status'] == 1) {
              this.event_status = 'OCCUPIED';
              this.uiChanges(currentDateTime);
            }
          } else {
            this.currentEventData = null;
            this.event_status = 'AVAILABLE';
            this.uiChanges(currentDateTime);
          }
        });
      }
    });
  }

  truncate = (input) =>
    input.length > 26 ? `${input.substring(0, 26)}...` : input;

  startTime() {
    this.intervalTimer = setInterval(
      function () {
        this.todayTime = formatDate(new Date(), 'h:mm', this.locale);
        this.todayTimeTxt = formatDate(new Date(), 'a', this.locale);
      }.bind(this),
      500
    );
  }

  refreshData() {
    let currentDateTime = formatDate(
      new Date(),
      'yyyy-MM-dd HH:mm',
      this.locale
    );
    this.db.getEventStatus(currentDateTime).then((res) => {
      AppConfig.consoleLog('check Event Status', res);
      if (res) {
        if (res['event_status'] == 0) {
          AppConfig.consoleLog('Event Status - PENDING');
          var newDateObj = moment(new Date(res.start_datetime))
            .add(15, 'm')
            .toDate();
          let endDateTime = formatDate(
            newDateObj,
            'yyyy-MM-dd HH:mm',
            this.locale
          );
          var eDate = new Date(endDateTime);
          var sDate = new Date(currentDateTime);
          if (sDate >= eDate) {
            AppConfig.consoleLog('current Event exceeded checked-in limit');
            this.db
              .releaseEventStatus(this.currentEventData?.id, currentDateTime)
              .then(async (res) => {
                AppConfig.consoleLog('current Event released');
              });
            this.router.navigate([`offline-dashboard-available`], {
              replaceUrl: true,
            });
          } else {
            this.router.navigate([`offline-dashboard-pending`], {
              replaceUrl: true,
            });
          }
        } else if (res['event_status'] == 1) {
          AppConfig.consoleLog('Event Status - OCCUIPIED');
          this.router.navigate([`offline-dashboard-occupied`], {
            replaceUrl: true,
          });
        }
      } else {
        AppConfig.consoleLog('Event Status - AVAILABLE');
        this.router.navigate([`offline-dashboard-available`], {
          replaceUrl: true,
        });
      }
    });
  }

  getUpcomingEventsByDate(currentDateTime) {
    this.db.dbState().subscribe((res) => {
      if (res) {
        this.db.getUpcomingEventsByDate(currentDateTime).then((item) => {
          this.upcomingEventsList = item;
          for (var i = 0; i < this.upcomingEventsList.length; i++) {
            this.upcomingEventsList[i]['start_date'] = formatDate(
              this.upcomingEventsList[i]['start_datetime'],
              'MMM d',
              this.locale
            );
            this.upcomingEventsList[i]['start_time'] = formatDate(
              this.upcomingEventsList[i]['start_datetime'],
              'h:mm',
              this.locale
            );
            this.upcomingEventsList[i]['start_timetxt'] = formatDate(
              this.upcomingEventsList[i]['start_datetime'],
              'a',
              this.locale
            );
            this.upcomingEventsList[i]['end_time'] = formatDate(
              this.upcomingEventsList[i]['end_datetime'],
              'h:mm',
              this.locale
            );
            this.upcomingEventsList[i]['end_timetxt'] = formatDate(
              this.upcomingEventsList[i]['end_datetime'],
              'a',
              this.locale
            );
            this.upcomingEventsList[i]['start_datetime'] = formatDate(
              this.upcomingEventsList[i]['start_datetime'],
              'h:mm a',
              this.locale
            );
            this.upcomingEventsList[i]['end_datetime'] = formatDate(
              this.upcomingEventsList[i]['end_datetime'],
              'h:mm a',
              this.locale
            );
          }
          AppConfig.consoleLog('upcomingEventsList', this.upcomingEventsList);
          if (this.event_status == 'AVAILABLE') {
            this.sliderTitle = 'UPCOMING EVENTS';
          } else if (this.event_status == 'PENDING') {
            this.sliderTitle = 'CURRENT EVENT';
          } else if (this.event_status == 'OCCUPIED') {
            this.sliderTitle = 'IN SESSION';
          }
          if (this.upcomingEventsList.length > 0) {
            let slides = document.getElementsByClassName('slides');
            for (let i = 0; i < slides.length; ++i) {
              let item = slides[i];
              item.setAttribute(
                'style',
                'visibility:visible;width:100%;height:100%;'
              );
            }
            let no_events = document.getElementsByClassName('no_events');
            for (let i = 0; i < no_events.length; ++i) {
              let item = no_events[i];
              item.setAttribute('style', 'visibility:hidden;width:0;height:0;');
            }
            let slide_prev = document.getElementsByClassName('slide-prev');
            for (let i = 0; i < slide_prev.length; ++i) {
              let item = slide_prev[i];
              item.setAttribute('style', 'color:#c8c3c3;');
            }
            let slide_next = document.getElementsByClassName('slide-next');
            for (let i = 0; i < slide_next.length; ++i) {
              let item = slide_next[i];
              item.setAttribute('style', 'color:#FFF;');
            }
          } else {
            let slides = document.getElementsByClassName('slides');
            for (let i = 0; i < slides.length; ++i) {
              let item = slides[i];
              item.setAttribute('style', 'visibility:hidden;width:0;height:0;');
            }
            let no_events = document.getElementsByClassName('no_events');
            for (let i = 0; i < no_events.length; ++i) {
              let item = no_events[i];
              item.setAttribute(
                'style',
                'visibility:visible;width:100%;height:100%;'
              );
            }
          }
        });
      }
    });
  }

  slideChange(event) {
    AppConfig.consoleLog('event slide', event);
    let slide_prev = document.getElementsByClassName('slide-prev');
    for (let i = 0; i < slide_prev.length; ++i) {
      let item = slide_prev[i];
      item.setAttribute('style', 'color:#FFF;');
    }
    let slide_next = document.getElementsByClassName('slide-next');
    for (let i = 0; i < slide_next.length; ++i) {
      let item = slide_next[i];
      item.setAttribute('style', 'color:#FFF;');
    }
    event.target.isEnd().then((isEnd) => {
      AppConfig.consoleLog('End of slide', isEnd);
      if (isEnd) {
        let slide_prev = document.getElementsByClassName('slide-prev');
        for (let i = 0; i < slide_prev.length; ++i) {
          let item = slide_prev[i];
          item.setAttribute('style', 'color:#FFF;');
        }
        let slide_next = document.getElementsByClassName('slide-next');
        for (let i = 0; i < slide_next.length; ++i) {
          let item = slide_next[i];
          item.setAttribute('style', 'color:#c8c3c3;');
        }
      }
    });
    event.target.isBeginning().then((istrue) => {
      AppConfig.consoleLog('End of slide', istrue);
      if (istrue) {
        let slide_prev = document.getElementsByClassName('slide-prev');
        for (let i = 0; i < slide_prev.length; ++i) {
          let item = slide_prev[i];
          item.setAttribute('style', 'color:#c8c3c3;');
        }
        let slide_next = document.getElementsByClassName('slide-next');
        for (let i = 0; i < slide_next.length; ++i) {
          let item = slide_next[i];
          item.setAttribute('style', 'color:#FFF;');
        }
      }
      if (this.event_status == 'AVAILABLE') {
        if (istrue) {
          this.sliderTitle = 'UPCOMING EVENT';
        } else {
          this.sliderTitle = 'NEXT EVENT';
        }
      } else if (this.event_status == 'PENDING') {
        if (istrue) {
          this.sliderTitle = 'CURRENT EVENT';
        } else {
          this.sliderTitle = 'NEXT EVENT';
        }
      } else if (this.event_status == 'OCCUPIED') {
        if (istrue) {
          this.sliderTitle = 'IN SESSION';
        } else {
          this.sliderTitle = 'NEXT EVENT';
        }
      }
    });
  }

  public next(slides) {
    AppConfig.consoleLog('slides', slides);
    this.slides.slideNext();
  }

  public prev(slides) {
    AppConfig.consoleLog('slides', slides);
    this.slides.slidePrev();
  }

  uiChanges(currentDateTime) {
    let event_holder = document.getElementsByClassName('event-holder');
    for (let i = 0; i < event_holder.length; ++i) {
      let item = event_holder[i];
      item.setAttribute('style', 'visibility:visible;width:100%;height:100%;');
    }
    let event_loading_holder = document.getElementsByClassName(
      'event-loading-holder'
    );
    for (let i = 0; i < event_loading_holder.length; ++i) {
      let item = event_loading_holder[i];
      item.setAttribute('style', 'visibility:hidden;width:0;height:0;');
    }
    let loading_holder = document.getElementsByClassName('loading-holder');
    for (let i = 0; i < loading_holder.length; ++i) {
      let item = loading_holder[i];
      item.setAttribute('style', 'visibility:hidden;width:0;height:0;');
    }
    let loading_gif = document.getElementsByClassName('event-loading-holder');
    for (let i = 0; i < loading_gif.length; ++i) {
      let item = loading_gif[i];
      item.setAttribute('style', 'visibility:hidden;width:0;height:0;');
    }
    if (this.event_status == 'PENDING') {
      let layer = document.getElementsByClassName('layer');
      for (let i = 0; i < layer.length; ++i) {
        let item = layer[i];
        item.setAttribute('style', 'background-color:rgba(201, 87, 8, 0.7);');
      }
      let room_status = document.getElementsByClassName('room-status');
      for (let i = 0; i < room_status.length; ++i) {
        let item = room_status[i];
        item.setAttribute('style', 'background-color:#c95708;');
      }
      let eventtitletxt = document.getElementsByClassName('event-title-txt');
      for (let i = 0; i < eventtitletxt.length; ++i) {
        let item = eventtitletxt[i];
        item.setAttribute('style', 'background-color:#c95708;');
      }
    } else if (this.event_status == 'OCCUPIED') {
      let layer = document.getElementsByClassName('layer');
      for (let i = 0; i < layer.length; ++i) {
        let item = layer[i];
        item.setAttribute('style', 'background-color:rgba(146, 31, 46, 0.7);');
      }
      let room_status = document.getElementsByClassName('room-status');
      for (let i = 0; i < room_status.length; ++i) {
        let item = room_status[i];
        item.setAttribute('style', 'background-color:#921f2e;');
      }
      let eventtitletxt = document.getElementsByClassName('event-title-txt');
      for (let i = 0; i < eventtitletxt.length; ++i) {
        let item = eventtitletxt[i];
        item.setAttribute('style', 'background-color:#921f2e;');
      }
    } else if (this.event_status == 'AVAILABLE') {
      let layer = document.getElementsByClassName('layer');
      for (let i = 0; i < layer.length; ++i) {
        let item = layer[i];
        item.setAttribute('style', 'background-color:rgba(20, 111, 56, 0.7);');
      }
      let room_status = document.getElementsByClassName('room-status');
      for (let i = 0; i < room_status.length; ++i) {
        let item = room_status[i];
        item.setAttribute('style', 'background-color:#146f38;');
      }
      let eventtitletxt = document.getElementsByClassName('event-title-txt');
      for (let i = 0; i < eventtitletxt.length; ++i) {
        let item = eventtitletxt[i];
        item.setAttribute('style', 'background-color:#146f38;');
      }
    }
    this.getUpcomingEventsByDate(currentDateTime);
  }

  ionViewDidEnter() {
    setTimeout(() => {
      let currentDateTime = formatDate(
        new Date(),
        'yyyy-MM-dd HH:mm',
        this.locale
      );
      this.uiChanges(currentDateTime);
    }, 300);
    this.intervalRefreshData = setInterval(() => {
      AppConfig.consoleLog('5 secs interval');
      this.refreshData();
    }, 5000);
  }

  ionViewWillLeave() {
    clearInterval(this.intervalTimer);
    clearInterval(this.intervalRefreshData);
  }

  async checkinEvent() {
    const alert = await this.alertController.create({
      cssClass: 'admin-pwd-alert',
      message: 'Are you sure you want to check In Now?',
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
              .verifyDepartmentPassword(
                this.currentEventData?.dept_name,
                data.password
              )
              .then(async (res) => {
                (await loader).dismiss();
                if (res) {
                  let loader = this.loadingCtrl.create({
                    cssClass: 'custom-loader',
                    spinner: 'lines-small',
                  });
                  (await loader).present();
                  this.db
                    .updateEventStatus(this.currentEventData?.id)
                    .then(async (res) => {
                      AppConfig.consoleLog('Current Event checked in');
                      (await loader).dismiss();
                      this.refreshData();
                    });
                } else {
                  if (data.password == this.device_password) {
                    let loader = this.loadingCtrl.create({
                      cssClass: 'custom-loader',
                      spinner: 'lines-small',
                    });
                    (await loader).present();
                    this.db
                      .updateEventStatus(this.currentEventData?.id)
                      .then(async (res) => {
                        AppConfig.consoleLog('Current Event checked in');
                        (await loader).dismiss();
                        this.refreshData();
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

  async releaseEvent() {
    if (this.event_status == 'OCCUPIED') {
      const alert = await this.alertController.create({
        cssClass: 'admin-pwd-alert',
        message: 'Are you sure you want to release now?',
        inputs: [
          {
            name: 'password',
            type: 'text',
            placeholder: 'Department Password',
          },
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
                .verifyDepartmentPassword(
                  this.currentEventData?.dept_name,
                  data.password
                )
                .then(async (res) => {
                  (await loader).dismiss();
                  if (res) {
                    let currentDateTime = formatDate(
                      new Date(),
                      'yyyy-MM-dd HH:mm',
                      this.locale
                    );
                    this.db
                      .releaseEventStatus(
                        this.currentEventData?.id,
                        currentDateTime
                      )
                      .then((res) => {
                        AppConfig.consoleLog('current Event released');
                        this.toast
                          .show(`Event released`, '2000', 'bottom')
                          .subscribe((_) => {});
                        this.refreshData();
                      });
                  } else {
                    if (data.password == this.device_password) {
                      let currentDateTime = formatDate(
                        new Date(),
                        'yyyy-MM-dd HH:mm',
                        this.locale
                      );
                      this.db
                        .releaseEventStatus(
                          this.currentEventData?.id,
                          currentDateTime
                        )
                        .then((res) => {
                          AppConfig.consoleLog('current Event released');
                          this.toast
                            .show(`Event released`, '2000', 'bottom')
                            .subscribe((_) => {});
                          this.refreshData();
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
  }

  async extendEvent() {
    if (this.event_status == 'OCCUPIED') {
      const alert = await this.alertController.create({
        cssClass: 'admin-pwd-alert',
        message: 'Are you sure you want to extend?',
        inputs: [
          {
            name: 'password',
            type: 'text',
            placeholder: 'Department Password',
          },
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
                .verifyDepartmentPassword(
                  this.currentEventData?.dept_name,
                  data.password
                )
                .then(async (res) => {
                  (await loader).dismiss();
                  if (res) {
                    const modal = await this.modalCtrl.create({
                      component: EventExtendModalPage,
                      componentProps: { paramID: this.currentEventData?.id },
                      cssClass: 'event-view-modal',
                      backdropDismiss: false,
                    });
                    await modal.present();
                    modal.onDidDismiss().then((result) => {
                      AppConfig.consoleLog('current Event extended');
                      this.router.navigate([`offline-dashboard`], {
                        replaceUrl: true,
                      });
                    });
                  } else {
                    if (data.password == this.device_password) {
                      const modal = await this.modalCtrl.create({
                        component: EventExtendModalPage,
                        componentProps: { paramID: this.currentEventData?.id },
                        cssClass: 'event-view-modal',
                        backdropDismiss: false,
                      });
                      await modal.present();
                      modal.onDidDismiss().then((result) => {
                        AppConfig.consoleLog('current Event extended');
                        this.router.navigate([`offline-dashboard`], {
                          replaceUrl: true,
                        });
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
  }

  async spotBooking() {
    if (this.event_status == 'AVAILABLE') {
      this.db.getDepartments().then(async (item) => {
        if (item.length > 0) {
          const modal = await this.modalCtrl.create({
            component: EventBookModalPage,
            cssClass: 'event-add-modal',
            backdropDismiss: false,
          });
          await modal.present();
          modal.onDidDismiss().then((result) => {
            if (result.data && result.data.event) {
              let event = result.data.event;
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
                this.router.navigate([`offline-dashboard`], {
                  replaceUrl: true,
                });
              });
            }
          });
        } else {
          this.toast
            .show(`Departments not yet added`, '2000', 'bottom')
            .subscribe((_) => {});
        }
      });
    }
  }

  goPage(pmPage) {
    this.router.navigate([`offline-` + pmPage], { replaceUrl: true });
  }

  async openEventAddModal() {
    this.db.getDepartments().then(async (item) => {
      if (item.length > 0) {
        const modal = await this.modalCtrl.create({
          component: EventAddModalPage,
          cssClass: 'event-add-modal',
          backdropDismiss: false,
        });
        await modal.present();
        modal.onDidDismiss().then((result) => {
          if (result.data && result.data.event) {
            let eventData = result.data.event;
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
              this.db.addEvent(event).then((res) => {
                AppConfig.consoleLog('new event added');
              });
              if (index === array.length - 1) {
                AppConfig.consoleLog('add event - last index');
                this.router.navigate([`offline-dashboard`], {
                  replaceUrl: true,
                });
              }
            });
          }
        });
      } else {
        this.toast
          .show(`Departments not yet added`, '2000', 'bottom')
          .subscribe((_) => {});
      }
    });
  }

  async openEventListModal() {
    this.db.getDepartments().then(async (item) => {
      if (item.length > 0) {
        const modal = await this.modalCtrl.create({
          component: EventListModalPage,
          cssClass: 'event-list-modal',
          backdropDismiss: false,
        });
        await modal.present();
        modal.onDidDismiss().then((result) => {
          if (result.data && result.data.isDeleted) {
            this.router.navigate([`offline-dashboard`], { replaceUrl: true });
          }
        });
      } else {
        this.toast
          .show(`Departments not yet added`, '2000', 'bottom')
          .subscribe((_) => {});
      }
    });
  }

  async askAdminPassword() {
    const alert = await this.alertController.create({
      cssClass: 'admin-pwd-alert',
      message: 'Enter admin password',
      inputs: [{ name: 'password', type: 'text', placeholder: 'Password' }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {},
        },
        {
          text: 'Ok',
          handler: (data: any) => {
            if (data.password == this.device_password) {
              this.goPage('settings');
            } else {
              this.toast
                .show(AppConfig.INVALID_PASSWORD_MSG, '2000', 'bottom')
                .subscribe((_) => {});
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
