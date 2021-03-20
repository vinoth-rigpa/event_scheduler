import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Platform, ModalController, LoadingController } from '@ionic/angular';
import { Toast } from '@ionic-native/toast/ngx';
import { AppConfig } from '../../../config/appconfig';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
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
  selector: 'app-change-logo-modal',
  templateUrl: './change-logo-modal.page.html',
  styleUrls: ['./change-logo-modal.page.scss'],
})
export class ChangeLogoModalPage implements AfterViewInit {
  currentPage: string = 'Online ChangeLogoModalPage';
  device_uuid: any = '';
  device_password: any = '';
  roomName: string = '';
  roomID: string = '';
  modalReady = false;
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  responseData: any;
  fileUrl: any = null;
  images = [];
  newFileName = '';

  constructor(
    private camera: Camera,
    public loadingCtrl: LoadingController,
    private toast: Toast,
    private modalCtrl: ModalController,
    public platform: Platform,
    private network: Network,
    private file: File,
    private webview: WebView,
    private storage: Storage,
    private ref: ChangeDetectorRef,
    private filePath: FilePath
  ) {
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    this.roomID = localStorage.getItem('room_id');
    this.roomName = localStorage.getItem('room_name');
  }

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
    this.platform.ready().then(() => {
      this.loadStoredImages();
    });
  }

  loadStoredImages() {
    this.storage.get(AppConfig.LOGO_STORAGE_KEY).then((images) => {
      if (images) {
        this.newFileName = images;
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
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
    };

    this.camera.getPicture(options).then((imagePath) => {
      this.newFileName = `data:image/png;base64,` + imagePath;
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
          this.newFileName = newFileName;
          let filePath = this.file.dataDirectory + this.newFileName;
          let resPath = this.pathForImage(filePath);

          let newEntry = {
            name: this.newFileName,
            path: resPath,
            filePath: filePath,
          };
          this.images = [newEntry];
          this.ref.detectChanges();
        },
        (error) => {
          this.toast
            .show(`Error while storing file.`, '3000', 'bottom')
            .subscribe((_) => {});
        }
      );
  }

  updateLogo() {
    if (this.newFileName != '') {
      this.storage.set(AppConfig.LOGO_STORAGE_KEY, this.newFileName);
      this.toast.show('Logo changed', '2000', 'bottom').subscribe((_) => {});
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.modalReady = true;
      localStorage.setItem('popup_open', 'no');
    }, 0);
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
