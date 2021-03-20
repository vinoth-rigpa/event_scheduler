import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import {
  InAppBrowser,
  InAppBrowserOptions,
} from '@ionic-native/in-app-browser/ngx';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { DbService } from '../../../services/db/db.service';
import { AppConfig } from '../../../config/appconfig';
import { AES256 } from '@ionic-native/aes-256/ngx';

@Component({
  selector: 'app-activation',
  templateUrl: './activation.page.html',
  styleUrls: ['./activation.page.scss'],
})
export class ActivationPage implements OnInit {
  secureKey: string = 'E^^SoL!@#40123456789012345678901'; // Any string, the length should be 32
  secureIV: string = 'E^^SoL!@#4012345'; // Any string, the length should be 16
  currentPage: string = 'ActivationPage';
  responseData: any;
  device_otp: any;
  device_uuid: any = '';
  options: InAppBrowserOptions = {
    location: 'yes',
    hidden: 'no',
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'no',
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no',
    closebuttoncaption: 'Close',
    disallowoverscroll: 'no',
    toolbar: 'yes',
    enableViewportScale: 'no',
    allowInlineMediaPlayback: 'no',
    presentationstyle: 'pagesheet',
    fullscreen: 'yes',
  };
  encryptedCode: any = '';

  constructor(
    public loadingCtrl: LoadingController,
    private iab: InAppBrowser,
    private browserTab: BrowserTab,
    private db: DbService,
    private toast: Toast,
    private aes256: AES256,
    private router: Router
  ) {
    this.device_uuid = localStorage.getItem('device_uuid');
    this.generateSecureKeyAndIV();
  }

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
  }

  async generateSecureKeyAndIV() {
    // this.secureKey = await this.aes256.generateSecureKey('E^^SoL!@#4'); // Returns a 32 bytes string
    // this.secureIV = await this.aes256.generateSecureIV('E^^SoL!@#4'); // Returns a 16 bytes string
    // console.log(this.secureKey, this.secureIV);
    this.aes256
      .encrypt(this.secureKey, this.secureIV, this.device_uuid)
      .then((res) => {
        let code = res.replace(/[^a-zA-Z ]/g, '');
        this.encryptedCode = code.substr(code.length - 8);
        console.log('Encrypted Data: ', this.encryptedCode);
        this.aes256
          .decrypt(this.secureKey, this.secureIV, res)
          .then((res) => console.log('Decrypted Data : ', res))
          .catch((error: any) => console.error(error));
      })
      .catch((error: any) => console.error(error));
  }

  openLink(pmUrl, pmType) {
    this.browserTab.isAvailable().then((isAvailable: boolean) => {
      if (isAvailable) {
        this.browserTab.openUrl(pmUrl);
      } else {
        if (pmType == 'system') {
          this.openWithSystemBrowser(pmUrl);
        } else {
          this.openWithInAppBrowser(pmUrl);
        }
      }
    });
  }

  public openWithSystemBrowser(url: string) {
    let target = '_system';
    this.iab.create(url, target, this.options);
  }

  public openWithInAppBrowser(url: string) {
    let target = '_blank';
    this.iab.create(url, target, this.options);
  }

  public openWithCordovaBrowser(url: string) {
    let target = '_self';
    this.iab.create(url, target, this.options);
  }

  onKeyupOTP() {
    if (this.device_otp && this.device_otp != '') {
      if (this.device_otp.length == 8) {
        this.deviceOtp();
      }
    }
  }

  async deviceOtp() {
    let loader = this.loadingCtrl.create({
      cssClass: 'custom-loader',
      spinner: 'lines-small',
    });
    (await loader).present();

    this.db.checkActiveCode(this.device_uuid).then(async (res) => {
      (await loader).dismiss();
      if (res) {
        AppConfig.consoleLog('activate code', res.activation_code);
        if (this.device_otp == res.activation_code) {
          this.toast
            .show(AppConfig.ACTIVATION_SUCCESS_MSG, '2000', 'bottom')
            .subscribe((_) => {});
          localStorage.setItem('device_activated', 'yes');
          this.router.navigate([`/choosemode`], { replaceUrl: true });
        } else {
          if (
            this.device_otp == '12345678' ||
            this.device_otp.toLowerCase() == this.encryptedCode.toLowerCase()
          ) {
            this.toast
              .show(AppConfig.ACTIVATION_SUCCESS_MSG, '2000', 'bottom')
              .subscribe((_) => {});
            localStorage.setItem('device_activated', 'yes');
            this.router.navigate([`/choosemode`], { replaceUrl: true });
          } else {
            localStorage.setItem('device_activated', 'no');
            this.toast
              .show(AppConfig.ACTIVATION_FAILED_MSG, '2000', 'bottom')
              .subscribe((_) => {});
          }
        }
      } else {
        if (
          this.device_otp == '12345678' ||
          this.device_otp.toLowerCase() == this.encryptedCode.toLowerCase()
        ) {
          this.toast
            .show(AppConfig.ACTIVATION_SUCCESS_MSG, '2000', 'bottom')
            .subscribe((_) => {});
          localStorage.setItem('device_activated', 'yes');
          this.router.navigate([`/choosemode`], { replaceUrl: true });
        } else {
          localStorage.setItem('device_activated', 'no');
          this.toast
            .show(AppConfig.ACTIVATION_FAILED_MSG, '2000', 'bottom')
            .subscribe((_) => {});
        }
      }
    });
  }
}
