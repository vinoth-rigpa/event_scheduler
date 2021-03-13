import { Component, OnInit } from '@angular/core';
import { Department } from 'src/app/models/department';
import { Platform, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Toast } from '@ionic-native/toast/ngx';
import { AppConfig } from '../../../config/appconfig';
import { DbService } from '../../../services/db/db.service';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { ApiService } from '../../../services/api/api.service';
@Component({
  selector: 'app-department',
  templateUrl: './department.page.html',
  styleUrls: ['./department.page.scss'],
})
export class DepartmentPage implements OnInit {
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  responseData: any;
  device_uuid: any;
  departmentData: Department[] = [];
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
    AppConfig.consoleLog('DepartmentPage constructor');
    this.device_uuid = localStorage.getItem('device_uuid');
  }
  ngOnInit() {
    this.getDepartments();
    this.db.dbState().subscribe((res) => {
      if (res) {
        this.db.getDepartments().then((item) => {
          this.departmentData = item;
        });
      }
    });
  }
  async getDepartments() {
    if (this.networkAvailable) {
      let loader = this.loadingCtrl.create({
        cssClass: 'custom-loader',
        spinner: 'lines-small',
      });
      (await loader).present();

      this.apiService.getDeptList().then(
        async (res: any) => {
          AppConfig.consoleLog(' success ==> ', res);
        },
        async (err) => {
          AppConfig.consoleLog(' error ==> ', err);
          (await loader).dismiss();
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
  async deleteDepartment(id) {
    AppConfig.consoleLog(id);
    const alert = await this.alertCtrl.create({
      cssClass: 'admin-pwd-alert',
      message: 'Are you sure you want to delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            AppConfig.consoleLog('Confirm Cancel: blah');
          },
        },
        {
          text: 'Ok',
          handler: () => {
            AppConfig.consoleLog('Confirm Okay');
            this.db.deleteDepartment(id).then(async (res) => {
              this.db.getDepartments().then((item) => {
                this.departmentData = item;
                this.toast
                  .show(`Department deleted`, '2000', 'bottom')
                  .subscribe((toast) => {});
              });
            });
          },
        },
      ],
    });
    await alert.present();
  }
  addDepartmentPage() {
    this.router.navigate([`online/department-add`], { replaceUrl: true });
  }
  goBack() {
    this.router.navigate([`online/settings`], { replaceUrl: true });
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
