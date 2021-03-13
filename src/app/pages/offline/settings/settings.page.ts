import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AppConfig } from '../../../config/appconfig';
import { Toast } from '@ionic-native/toast/ngx';
import { DbService } from '../../../services/db/db.service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  device_uuid: any = '';
  device_password: any = '';
  roomName: string = '';
  page_timeout: any = 15000;
  constructor(
    public alertController: AlertController,
    private router: Router,
    private db: DbService,
    private toast: Toast
  ) {
    AppConfig.consoleLog('SettingsPage constructor');
    this.device_uuid = localStorage.getItem('device_uuid');
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
    this.router.navigate([`offline/` + pmPage], { replaceUrl: true });
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
          handler: () => {
            AppConfig.consoleLog('Confirm Cancel');
          },
        },
        {
          text: 'Ok',
          handler: (data: any) => {
            AppConfig.consoleLog('Saved Information', data.name);
            this.db.changeRoomName(data.name).then((res) => {
              this.toast
                .show(`Room Name updated successfully`, '2000', 'bottom')
                .subscribe((toast) => {});
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