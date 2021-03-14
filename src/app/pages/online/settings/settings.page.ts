import { Component, OnInit } from '@angular/core';
import { Platform, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Toast } from '@ionic-native/toast/ngx';
import { AppConfig } from '../../../config/appconfig';
import { DbService } from '../../../services/db/db.service';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { ApiService } from '../../../services/api/api.service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
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
    public platform: Platform,
    private apiService: ApiService,
    private db: DbService,
    private network: Network,
    private router: Router,
    private toast: Toast
  ) {
    AppConfig.consoleLog('Online SettingsPage constructor');
    this.device_uuid = localStorage.getItem('device_uuid');
    this.room_id = localStorage.getItem('room_id');
    this.device_password = localStorage.getItem('device_password');
    let device_timeout = localStorage.getItem('device_timeout');
    let timeoutSecs: number = +device_timeout;
    AppConfig.consoleLog(timeoutSecs + ' secs timeout');
    this.page_timeout = timeoutSecs;
    localStorage.setItem('popup_open', 'no');
  }

  ngOnInit() {
    this.db.dbState().subscribe((res) => {
      if (res) {
        this.db.getRoomDetail(this.device_uuid).then((res) => {
          AppConfig.consoleLog('getRoomDetail', res);
          this.roomName = res['room_name'];
        });
      }
    });
  }

  goPage(pmPage) {
    this.router.navigate([`online-` + pmPage], { replaceUrl: true });
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
          handler: () => {
            AppConfig.consoleLog('Confirm Cancel');
          },
        },
        {
          text: 'Ok',
          handler: async (data: any) => {
            AppConfig.consoleLog('Saved Information', data.name);
            if (this.networkAvailable) {
              let loader = this.loadingCtrl.create({
                cssClass: 'custom-loader',
                spinner: 'lines-small',
              });
              (await loader).present();

              this.apiService.changeRoomName(data.name, this.room_id).then(
                async (res: any) => {
                  AppConfig.consoleLog(' success ', res);
                  if (res?.status == 'success') {
                    this.db.changeRoomName(data.name).then((res) => {
                      this.toast
                        .show(
                          `Room Name updated successfully`,
                          '2000',
                          'bottom'
                        )
                        .subscribe((_) => {});
                    });
                  }
                  (await loader).dismiss();
                },
                async (err) => {
                  AppConfig.consoleLog(' error ', err);
                  (await loader).dismiss();
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
    // watch network for a disconnection
    this.network.onDisconnect().subscribe(() => {
      AppConfig.consoleLog('network.onDisconnect event subscribed');
      this.networkAvailable = false;
    });
    // watch network for a connection
    this.network.onConnect().subscribe(() => {
      AppConfig.consoleLog('network.onConnect event subscribed');
      this.networkAvailable = true;
    });
  }

  networkUnsubscribe() {
    // stop connect watch
    this.connectSubscription.unsubscribe();
    AppConfig.consoleLog('network.onConnect event unsubscribed');
    // stop disconnect watch
    this.disconnectSubscription.unsubscribe();
    AppConfig.consoleLog('network.onDisconnect event unsubscribed');
  }

  ionViewWillEnter() {
    AppConfig.consoleLog('ActivationPage ionViewWillEnter');
  }

  ionViewDidEnter() {
    AppConfig.consoleLog('ActivationPage ionViewDidEnter');
    if (this.isConnected()) {
      this.networkAvailable = true;
      AppConfig.consoleLog('Network available');
    } else {
      this.networkAvailable = false;
      AppConfig.consoleLog('Network unavailable');
    }
    this.networkSubscribe();
  }

  ionViewWillLeave() {
    AppConfig.consoleLog('ActivationPage ionViewWillLeave');
  }

  ionViewDidLeave() {
    AppConfig.consoleLog('ActivationPage ionViewDidLeave');
  }
}
