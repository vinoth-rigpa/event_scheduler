import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { AppConfig } from '../../../config/appconfig';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {
  currentPage: string = 'SplashPage';
  constructor(
    private router: Router,
    private androidPermissions: AndroidPermissions
  ) {}

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
    this.androidPermissions
      .checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
      .then(
        (result) => {
          console.log('Has permission?', result.hasPermission);
          if (!result.hasPermission) {
            this.androidPermissions.requestPermission(
              this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE
            );
          }
        },
        (err) =>
          this.androidPermissions.requestPermission(
            this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE
          )
      );
  }

  ionViewDidEnter() {
    setTimeout(() => {
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
    }, 8000);
  }
}
