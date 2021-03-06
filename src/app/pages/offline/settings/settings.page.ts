import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AppConfig } from '../../../config/appconfig';
import { Toast } from '@ionic-native/toast/ngx';
import { DbService } from '../../../services/db/db.service';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { ChangeLogoModalPage } from '../../common/change-logo-modal/change-logo-modal.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  currentPage: string = 'Offline SettingsPage';
  device_uuid: any = '';
  device_password: any = '';
  roomName: string = '';
  page_timeout: any = 15000;

  constructor(
    public alertController: AlertController,
    private modalCtrl: ModalController,
    private router: Router,
    private db: DbService,
    private openNativeSettings: OpenNativeSettings,
    private toast: Toast
  ) {
    this.device_uuid = localStorage.getItem('device_uuid');
    this.device_password = localStorage.getItem('device_password');
    let device_timeout = localStorage.getItem('device_timeout');
    let timeoutSecs: number = +device_timeout;
    this.page_timeout = timeoutSecs;
    localStorage.setItem('popup_open', 'no');
  }

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
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
    this.router.navigate([`offline-` + pmPage], { replaceUrl: true });
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
    const alert = await this.alertController.create({
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
          handler: (data: any) => {
            this.db.changeRoomName(data.name).then((res) => {
              this.roomName = data.name;
              this.toast
                .show(`Room Name updated successfully`, '2000', 'bottom')
                .subscribe((_) => {});
            });
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
}
