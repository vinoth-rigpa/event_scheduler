import {
  Component,
  AfterViewInit,
  Inject,
  LOCALE_ID,
  ChangeDetectorRef,
} from '@angular/core';
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
import { File, FileEntry } from '@ionic-native/File/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Storage } from '@ionic/storage';
import { FilePath } from '@ionic-native/file-path/ngx';
import {
  Camera,
  CameraOptions,
  PictureSourceType,
} from '@ionic-native/Camera/ngx';

@Component({
  selector: 'app-event-add-modal',
  templateUrl: './event-add-modal.page.html',
  styleUrls: ['./event-add-modal.page.scss'],
})
export class EventAddModalPage implements AfterViewInit {
  currentPage: string = 'Online EventAddModalPage';
  device_uuid: any = '';
  device_password: any = '';
  roomName: string = '';
  roomID: string = '';
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
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  responseData: any;
  isAdded = false;
  fileUrl: any = null;
  images = [];

  constructor(
    private camera: Camera,
    private db: DbService,
    public loadingCtrl: LoadingController,
    public formBuilder: FormBuilder,
    @Inject(LOCALE_ID) private locale: string,
    private toast: Toast,
    private modalCtrl: ModalController,
    public platform: Platform,
    private network: Network,
    private apiService: ApiService,
    private file: File,
    private webview: WebView,
    private storage: Storage,
    private ref: ChangeDetectorRef,
    private filePath: FilePath
  ) {
    this.minDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    this.maxDate = moment().add(1, 'y').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    this.roomID = localStorage.getItem('room_id');
    this.roomName = localStorage.getItem('room_name');
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
    this.platform.ready().then(() => {
      this.loadStoredImages();
    });
  }

  loadStoredImages() {
    this.storage.get(AppConfig.IMAGE_STORAGE_KEY).then((images) => {
      if (images) {
        let arr = JSON.parse(images);
        AppConfig.consoleLog('arr', arr);
        this.images = [];
        for (let img of arr) {
          let filePath = this.file.dataDirectory + img;
          AppConfig.consoleLog('filePath', filePath);
          let resPath = this.pathForImage(filePath);
          AppConfig.consoleLog('resPath', resPath);
          this.images.push({ name: img, path: resPath, filePath: filePath });
        }
      }
    });
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  imageUpload() {
    this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
  }

  takePicture(sourceType: PictureSourceType) {
    var options: CameraOptions = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
    };

    this.camera.getPicture(options).then((imagePath) => {
      if (
        this.platform.is('android') &&
        sourceType === this.camera.PictureSourceType.PHOTOLIBRARY
      ) {
        this.filePath.resolveNativePath(imagePath).then((filePath) => {
          let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
          let currentName = imagePath.substring(
            imagePath.lastIndexOf('/') + 1,
            imagePath.lastIndexOf('?')
          );

          AppConfig.consoleLog('correctPath', correctPath);
          AppConfig.consoleLog('currentName', currentName);
          AppConfig.consoleLog('createFileName', this.createFileName());
          this.copyFileToLocalDir(
            correctPath,
            currentName,
            this.createFileName()
          );
        });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(
          correctPath,
          currentName,
          this.createFileName()
        );
      }
    });
  }

  createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + '.jpg';
    return newFileName;
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file
      .copyFile(namePath, currentName, this.file.dataDirectory, newFileName)
      .then(
        (success) => {
          this.updateStoredImages(newFileName);
        },
        (error) => {
          this.toast
            .show(`Error while storing file.`, '3000', 'bottom')
            .subscribe((_) => {});
        }
      );
  }

  updateStoredImages(name) {
    this.storage.get(AppConfig.IMAGE_STORAGE_KEY).then((images) => {
      let arr = JSON.parse(images);
      AppConfig.consoleLog('arr', arr);
      if (!arr) {
        let newImages = [name];
        this.storage.set(
          AppConfig.IMAGE_STORAGE_KEY,
          JSON.stringify(newImages)
        );
      } else {
        arr.push(name);
        this.storage.set(AppConfig.IMAGE_STORAGE_KEY, JSON.stringify(arr));
      }

      let filePath = this.file.dataDirectory + name;
      let resPath = this.pathForImage(filePath);

      let newEntry = {
        name: name,
        path: resPath,
        filePath: filePath,
      };

      // this.images = [newEntry, ...this.images];
      this.images = [newEntry];
      this.ref.detectChanges(); // trigger change detection cycle
    });
  }

  deleteImage(imgEntry, position) {
    this.images.splice(position, 1);

    this.storage.get(AppConfig.IMAGE_STORAGE_KEY).then((images) => {
      let arr = JSON.parse(images);
      let filtered = arr.filter((name) => name != imgEntry.name);
      this.storage.set(AppConfig.IMAGE_STORAGE_KEY, JSON.stringify(filtered));

      var correctPath = imgEntry.filePath.substr(
        0,
        imgEntry.filePath.lastIndexOf('/') + 1
      );

      this.file.removeFile(correctPath, imgEntry.name).then((res) => {
        this.toast.show(`File removed.`, '3000', 'bottom').subscribe((_) => {});
      });
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
                this.addEvent();
              } else {
                if (
                  this.eventForm.value.dept_password == this.device_password
                ) {
                  localStorage.setItem('popup_open', 'no');
                  this.addEvent();
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

  async addEvent() {
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
    let currentDate = formatDate(new Date(), 'yyyy-MM-dd', this.locale);
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
            start_datetime: start.clone().format('yyyy-MM-DD') + ' ' + sTime,
            end_datetime: start.clone().format('yyyy-MM-DD') + ' ' + eTime,
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
            start_datetime: current.clone().format('yyyy-MM-DD') + ' ' + sTime,
            end_datetime: current.clone().format('yyyy-MM-DD') + ' ' + eTime,
            organizer: this.eventForm.value.organizer,
            dept_password: this.eventForm.value.dept_password,
          };
          eventDataArr.push(eventData);
        }
      }
    }
    if (eventDataArr.length == 0) {
      eventDataArr.push(this.eventForm.value);
    }
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
          .setEventTable(this.roomName, this.roomID, eventInputArr)
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
                  this.db.addEvent(event).then((res) => {
                    AppConfig.consoleLog('new event added');
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
