import { Component, HostListener } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Device } from '@ionic-native/device/ngx';
import { AppConfig } from './config/appconfig';
import { Router } from '@angular/router';
import {
  NativePageTransitions,
  NativeTransitionOptions,
} from '@ionic-native/native-page-transitions/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private device: Device,
    private nativePageTransitions: NativePageTransitions,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      localStorage.setItem('device_uuid', this.device.uuid);
      if (localStorage.getItem('device_timeout') == null) {
        localStorage.setItem('device_timeout', '30000');
      }
      // this.restartIdleLogoutTimer();
      this.router.navigate([`/splash`], { replaceUrl: true });
    });
  }

  @HostListener('touchstart')
  @HostListener('document:keyup', ['$event'])
  @HostListener('document:click', ['$event'])
  @HostListener('document:wheel', ['$event'])
  onTouchStart() {
    this.restartIdleLogoutTimer();
  }

  idleLogoutTimer;

  restartIdleLogoutTimer() {
    clearTimeout(this.idleLogoutTimer);
    let device_timeout = localStorage.getItem('device_timeout');
    let timeoutSecs: number = +device_timeout;
    this.idleLogoutTimer = setTimeout(() => {
      this.redirectToHome();
    }, timeoutSecs);
  }

  redirectToHome() {
    if (localStorage.getItem('popup_open') == 'yes') {
      AppConfig.consoleLog('picker opend');
    } else {
      const removeElements = (elms) => elms.forEach((el) => el.remove());
      removeElements(document.querySelectorAll('.admin-pwd-alert'));
      removeElements(document.querySelectorAll('.event-add-modal'));
      removeElements(document.querySelectorAll('.event-list-modal'));
      removeElements(document.querySelectorAll('.event-edit-modal'));
      removeElements(document.querySelectorAll('.event-view-modal'));

      let options: NativeTransitionOptions = {
        duration: 500,
        androiddelay: 0,
        iosdelay: 0,
        href: null,
      };

      this.nativePageTransitions.fade(options);

      if (localStorage.getItem('device_configured') == 'yes') {
        if (localStorage.getItem('device_mode') == 'offline') {
          this.router.navigate([`offline-dashboard`], { replaceUrl: true });
        } else if (localStorage.getItem('device_mode') == 'online') {
          this.router.navigate([`online-dashboard`], { replaceUrl: true });
        }
      } else {
        if (localStorage.getItem('device_activated') == 'yes') {
          this.router.navigate([`/choosemode`], { replaceUrl: true });
        } else {
          this.router.navigate([`/activation`], { replaceUrl: true });
        }
      }
    }
  }
}
