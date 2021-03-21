import { Component, OnInit } from '@angular/core';
import {
  Platform,
  AlertController,
  ModalController,
  LoadingController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { Toast } from '@ionic-native/toast/ngx';
import { AppConfig } from '../../../config/appconfig';
import { DbService } from '../../../services/db/db.service';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { ApiService } from '../../../services/api/api.service';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { ChangeLogoModalPage } from '../../common/change-logo-modal/change-logo-modal.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  currentPage: string = 'Online SettingsPage';
  device_uuid: any = '';
  room_id: any = '';
  device_password: any = '';
  roomName: string = '';
  page_timeout: any = 15000;
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  responseData: any;
  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    public platform: Platform,
    private apiService: ApiService,
    private db: DbService,
    private network: Network,
    private router: Router,
    private openNativeSettings: OpenNativeSettings,
    private toast: Toast
  ) {
    this.device_uuid = localStorage.getItem('device_uuid');
    this.room_id = localStorage.getItem('room_id');
    this.roomName = localStorage.getItem('room_name');
    this.device_password = localStorage.getItem('device_password');
    let device_timeout = localStorage.getItem('device_timeout');
    let timeoutSecs: number = +device_timeout;
    this.page_timeout = timeoutSecs;
    localStorage.setItem('popup_open', 'no');
  }

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
  }

  goPage(pmPage) {
    this.router.navigate([`online-` + pmPage], { replaceUrl: true });
  }

  openSettingsMenu() {
    if (this.openNativeSettings) {
      console.log('openNativeSettingsTest is active');
      this.openNativeSettings.open('settings').then(
        (val) => {
          console.log('success');
        },
        (err) => {
          console.log('error', err);
        }
      );
    } else {
      console.log('this.openNativeSettings is not active!');
    }
  }

  async changeLogo() {
    const modal = await this.modalCtrl.create({
      component: ChangeLogoModalPage,
      cssClass: 'change-logo-modal',
      backdropDismiss: false,
    });
    await modal.present();
    modal.onDidDismiss().then((result) => {
      AppConfig.consoleLog('current Event extended');
    });
  }

  async changeRoomName() {
    const alert = await this.alertCtrl.create({
      cssClass: 'admin-pwd-alert',
      message: 'Room Name',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Room Name',
          value: this.roomName,
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
            if (this.networkAvailable) {
              let loader = this.loadingCtrl.create({
                cssClass: 'custom-loader',
                spinner: 'lines-small',
              });
              (await loader).present();

              this.apiService.changeRoomName(data.name, this.room_id).then(
                async (res: any) => {
                  if (res?.status == 'success') {
                    this.db.changeRoomName(data.name).then((res) => {
                      localStorage.setItem('room_name', data.name);
                      this.roomName = localStorage.getItem('room_name');
                      this.toast
                        .show(
                          `Room Name updated successfully`,
                          '2000',
                          'bottom'
                        )
                        .subscribe((_) => {});
                    });
                  } else if (
                    res?.status == 'error' ||
                    res?.status == 'failure'
                  ) {
                    this.toast
                      .show(` ` + res?.reason + ` `, '2000', 'bottom')
                      .subscribe((_) => {});
                  }
                  (await loader).dismiss();
                },
                async (err) => {
                  (await loader).dismiss();
                  this.toast
                    .show(
                      `Server unreachable. Try again later.`,
                      '2000',
                      'bottom'
                    )
                    .subscribe((_) => {});
                }
              );
            } else {
              this.toast
                .show(`No internet available`, '2000', 'bottom')
                .subscribe((_) => {});
            }
          },
        },
      ],
    });
    await alert.present();
  }

  openPopupWindow() {
    localStorage.setItem('popup_open', 'yes');
  }

  onSelectChange(selectedValue: any) {
    localStorage.setItem('popup_open', 'no');
    if (selectedValue.detail.value) {
      this.page_timeout = selectedValue.detail.value;
      localStorage.setItem('device_timeout', this.page_timeout);
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
