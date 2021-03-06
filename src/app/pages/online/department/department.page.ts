import { Component, OnInit } from '@angular/core';
import { Department } from '../../../models/department';
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
  currentPage: string = 'Online DepartmentPage';
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  responseData: any;
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
  ) {}

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
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
          if (res?.departmentList && res.departmentList.length > 0) {
            for (let i = 0; i < res.departmentList.length; i++) {
              this.db
                .checkDepartmentExists(res.departmentList[i].department)
                .then(async (res1) => {
                  if (res1) {
                    if (i == res.departmentList.length - 1) {
                      this.fetchDepartments();
                    }
                  } else {
                    this.db
                      .addDepartment(
                        res.departmentList[i].department,
                        res.departmentList[i].password
                      )
                      .then((res2) => {
                        if (i == res.departmentList.length - 1) {
                          this.fetchDepartments();
                        }
                      });
                  }
                });
            }
          } else {
            this.fetchDepartments();
          }
          (await loader).dismiss();
        },
        async (err) => {
          (await loader).dismiss();
          this.fetchDepartments();
        }
      );
    } else {
      this.toast
        .show(`No internet available`, '2000', 'bottom')
        .subscribe((_) => {});
      this.fetchDepartments();
    }
  }

  fetchDepartments() {
    this.db.getDepartments().then((item) => {
      this.departmentData = item;
      if (this.departmentData.length > 0) {
        let no_departments = document.getElementsByClassName('no_departments');
        for (let i = 0; i < no_departments.length; ++i) {
          let item = no_departments[i];
          item.setAttribute('style', 'visibility:hidden;width:0;height:0;');
        }
      } else {
        let no_departments = document.getElementsByClassName('no_departments');
        for (let i = 0; i < no_departments.length; ++i) {
          let item = no_departments[i];
          item.setAttribute(
            'style',
            'visibility:visible;width:100%;height:100%;'
          );
        }
      }
    });
  }

  async deleteDepartment(item) {
    const alert = await this.alertCtrl.create({
      cssClass: 'admin-pwd-alert',
      message: 'Are you sure you want to delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {},
        },
        {
          text: 'Ok',
          handler: async () => {
            if (this.networkAvailable) {
              let loader = this.loadingCtrl.create({
                cssClass: 'custom-loader',
                spinner: 'lines-small',
              });
              (await loader).present();
              this.apiService
                .updateDeptTable('delete', [
                  {
                    department: item.dept_name,
                    password: item.dept_password,
                  },
                ])
                .then(
                  async (res: any) => {
                    if (res?.status == 'success') {
                      this.db.deleteDepartment(item.id).then(async (res) => {
                        this.fetchDepartments();
                        this.toast
                          .show(`Department deleted`, '2000', 'bottom')
                          .subscribe((_) => {});
                      });
                    }
                    (await loader).dismiss();
                  },
                  async (err) => {
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

  addDepartmentPage() {
    this.router.navigate([`online-department-add`], { replaceUrl: true });
  }

  goBack() {
    this.router.navigate([`online-settings`], { replaceUrl: true });
  }

  isConnected(): boolean {
    let conntype = this.network.type;
    return conntype && conntype !== 'unknown' && conntype !== 'none';
  }

  networkSubscribe() {
    this.network.onDisconnect().subscribe(() => {
      this.networkAvailable = false;
    });
    this.network.onConnect().subscribe(() => {
      this.networkAvailable = true;
    });
  }

  networkUnsubscribe() {
    this.connectSubscription.unsubscribe();
    this.disconnectSubscription.unsubscribe();
  }

  ionViewDidEnter() {
    if (this.isConnected()) {
      this.networkAvailable = true;
      AppConfig.consoleLog('Network available');
    } else {
      this.networkAvailable = false;
      AppConfig.consoleLog('Network unavailable');
    }
    this.networkSubscribe();
    this.getDepartments();
  }
}
