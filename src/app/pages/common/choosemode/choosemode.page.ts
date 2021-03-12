import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network/ngx';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../config/appconfig';

@Component({
  selector: 'app-choosemode',
  templateUrl: './choosemode.page.html',
  styleUrls: ['./choosemode.page.scss'],
})
export class ChoosemodePage implements OnInit {
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  constructor(
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public storage: Storage,
    private network: Network,
    private router: Router
  ) {
    AppConfig.consoleLog('ChoosemodePage constructor');
    this.platform.backButton.subscribe(() => {
      AppConfig.consoleLog('Hardware Back Button Pressed');
    });
  }

  ngOnInit() {}

  chooseMode(pmMode) {
    AppConfig.consoleLog(pmMode);
    localStorage.setItem('device_mode', pmMode);
    if (pmMode == 'offline') {
      this.router.navigate([`offline/room-details`], { replaceUrl: true });
    } else if (pmMode == 'online') {
      this.router.navigate([`online/room-details`], { replaceUrl: true });
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
    AppConfig.consoleLog('ChoosemodePage ionViewWillEnter');
  }

  ionViewDidEnter() {
    AppConfig.consoleLog('ChoosemodePage ionViewDidEnter');
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
    AppConfig.consoleLog('ChoosemodePage ionViewWillLeave');
  }

  ionViewDidLeave() {
    AppConfig.consoleLog('ChoosemodePage ionViewDidLeave');
  }
}
