import { Component, OnInit } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Platform, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Toast } from '@ionic-native/toast/ngx';
import { AppConfig } from '../../../config/appconfig';
import { DbService } from '../../../services/db/db.service';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.page.html',
  styleUrls: ['./room-details.page.scss'],
})
export class RoomDetailsPage implements OnInit {
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  room_details_form: FormGroup;
  responseData: any;
  device_uuid: any;
  validation_messages = {
    room_id: [{ type: 'required', message: 'Enter a valid Room ID' }],
    room_name: [{ type: 'required', message: 'Room Name is required' }],
    room_password: [
      { type: 'required', message: 'Room password is required.' },
    ],
    network_url: [{ type: 'required', message: 'Server URL is required.' }],
  };
  pattern = '^[a-zA-Z0-9]+$';
  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    private apiService: ApiService,
    private db: DbService,
    private network: Network,
    private router: Router,
    private toast: Toast,
    public formBuilder: FormBuilder
  ) {
    AppConfig.consoleLog('ChoosemodePage constructor');
    this.device_uuid = localStorage.getItem('device_uuid');
  }

  ngOnInit() {
    this.room_details_form = this.formBuilder.group({
      room_id: new FormControl('', [
        Validators.required,
        Validators.pattern(this.pattern),
      ]),
      room_name: new FormControl('', Validators.required),
      room_password: new FormControl('', Validators.required),
      network_url: new FormControl(),
    });
  }

  goPage() {
    this.router.navigate([`online/dashboard`], { replaceUrl: true });
  }

  async storeData() {
    if (this.networkAvailable) {
      let api_url = this.room_details_form.value.network_url;
      if (
        !this.room_details_form.value.network_url.includes('http://') &&
        !this.room_details_form.value.network_url.includes('https://')
      ) {
        api_url = 'http://' + api_url;
      }

      let loader = this.loadingCtrl.create({
        cssClass: 'custom-loader',
        spinner: 'lines-small',
      });
      (await loader).present();

      this.apiService.getTime(api_url).then(
        async (res: any) => {
          AppConfig.consoleLog(' success ==> ', res);
          localStorage.setItem('api_url', api_url);
          this.apiService
            .registerDeviceConfig(
              this.room_details_form.value.room_name,
              this.room_details_form.value.room_id
            )
            .then(
              async (res: any) => {
                (await loader).dismiss();
                AppConfig.consoleLog(' success ==> ', res);
                this.db
                  .addRoomDetails(
                    this.device_uuid,
                    this.room_details_form.value.room_id,
                    this.room_details_form.value.room_name,
                    this.room_details_form.value.room_password
                  )
                  .then((res) => {
                    localStorage.setItem('device_configured', 'yes');
                    localStorage.setItem(
                      'device_password',
                      this.room_details_form.value.room_password
                    );
                    localStorage.setItem(
                      'room_name',
                      this.room_details_form.value.room_name
                    );
                    localStorage.setItem(
                      'room_id',
                      this.room_details_form.value.room_id
                    );
                    this.room_details_form.reset();
                    this.toast
                      .show(`Room details added`, '2000', 'bottom')
                      .subscribe((toast) => {
                        console.log(toast);
                      });
                    this.router.navigate([`online/dashboard`], {
                      replaceUrl: true,
                    });
                  });
              },
              async (err) => {
                AppConfig.consoleLog(' error ==> ', err);
                (await loader).dismiss();
                this.toast
                  .show(`Server Unreachable. Try again Later`, '2000', 'bottom')
                  .subscribe((toast) => {
                    AppConfig.consoleLog(toast);
                  });
              }
            );
        },
        async (err) => {
          AppConfig.consoleLog(' error ==> ', err);
          (await loader).dismiss();
          this.toast
            .show(`Server URL invalid`, '2000', 'bottom')
            .subscribe((toast) => {
              AppConfig.consoleLog(toast);
            });
        }
      );
    } else {
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
