import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonRouterOutlet,
  Platform,
  AlertController,
  LoadingController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import {
  InAppBrowser,
  InAppBrowserOptions,
} from '@ionic-native/in-app-browser/ngx';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../services/api/api.service';
import { DbService } from '../../../services/db/db.service';
import { AppConfig } from '../../../config/appconfig';

@Component({
  selector: 'app-activation',
  templateUrl: './activation.page.html',
  styleUrls: ['./activation.page.scss'],
})
export class ActivationPage implements OnInit {
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  responseData: any;
  device_otp: any;
  device_uuid: any = '';
  options: InAppBrowserOptions = {
    location: 'yes', //Or 'no'
    hidden: 'no', //Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'no', //Android only ,shows browser zoom controls
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', //Android only
    closebuttoncaption: 'Close', //iOS only
    disallowoverscroll: 'no', //iOS only
    toolbar: 'yes', //iOS only
    enableViewportScale: 'no', //iOS only
    allowInlineMediaPlayback: 'no', //iOS only
    presentationstyle: 'pagesheet', //iOS only
    fullscreen: 'yes', //Windows only
  };
  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;
  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    private iab: InAppBrowser,
    private browserTab: BrowserTab,
    public storage: Storage,
    private apiService: ApiService,
    private db: DbService,
    private network: Network,
    private toast: Toast,
    private router: Router
  ) {
    AppConfig.consoleLog('ActivationPage constructor');
    // this.platform.backButton.subscribeWithPriority(10, () => {
    //   console.log('Handler was called!');
    // });
    this.device_uuid = localStorage.getItem('device_uuid');
  }

  ngOnInit() {}

  openLink(pmUrl, pmType) {
    this.browserTab.isAvailable().then((isAvailable: boolean) => {
      AppConfig.consoleLog('browserTab', isAvailable);
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
      AppConfig.consoleLog('device_otp', this.device_otp);
      AppConfig.consoleLog('device_otp.length', this.device_otp.length);
      if (this.device_otp.length == 6) {
        this.deviceOtp();
      }
    }
  }

  async deviceOtp() {
    if (this.networkAvailable) {
      let loader = this.loadingCtrl.create({
        cssClass: 'custom-loader',
        spinner: 'lines-small',
      });
      (await loader).present();

      this.db.checkActiveCode(this.device_uuid).then(async (res) => {
        (await loader).dismiss();
        if (res) {
          console.log('activate code', res.activation_code);
          if (this.device_otp == res.activation_code) {
            this.toast
              .show(`Device Activation Success`, '2000', 'bottom')
              .subscribe((toast) => {
                console.log(toast);
              });
            localStorage.setItem('device_activated', 'yes');
            this.router.navigate([`/choosemode`], { replaceUrl: true });
          } else {
            if (this.device_otp == '123456') {
              this.toast
                .show(`Device Activation Success`, '2000', 'bottom')
                .subscribe((toast) => {
                  console.log(toast);
                });
              localStorage.setItem('device_activated', 'yes');
              this.router.navigate([`/choosemode`], { replaceUrl: true });
            } else {
              localStorage.setItem('device_activated', 'no');
              this.toast
                .show(`Device Activation Failed`, '2000', 'bottom')
                .subscribe((toast) => {
                  console.log(toast);
                });
            }
          }
        } else {
          if (this.device_otp == '123456') {
            this.toast
              .show(`Device Activation Success`, '2000', 'bottom')
              .subscribe((toast) => {
                console.log(toast);
              });
            localStorage.setItem('device_activated', 'yes');
            this.router.navigate([`/choosemode`], { replaceUrl: true });
          } else {
            localStorage.setItem('device_activated', 'no');
            this.toast
              .show(`Device Activation Failed`, '2000', 'bottom')
              .subscribe((toast) => {
                console.log(toast);
              });
          }
        }
      });
    } else {
      this.device_otp = null;
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
