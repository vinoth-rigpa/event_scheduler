import { Component, OnInit } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Platform, AlertController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Toast } from '@ionic-native/toast/ngx';
import { AppConfig } from '../../../config/appconfig';
import { DbService } from '../../../services/db/db.service';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';
import { ApiService } from '../../../services/api/api.service';
@Component({
  selector: 'app-department-edit',
  templateUrl: './department-edit.page.html',
  styleUrls: ['./department-edit.page.scss'],
})
export class DepartmentEditPage implements OnInit {
  editForm: FormGroup;
  id: any;
  validation_messages = {
    dept_name: [{ type: 'required', message: 'Department name is required.' }],
    dept_password: [
      { type: 'required', message: 'Department password is required.' },
    ],
  };
  connectSubscription: Subscription = new Subscription();
  disconnectSubscription: Subscription = new Subscription();
  networkAvailable: boolean = false;
  responseData: any;
  device_uuid: any;
  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    private apiService: ApiService,
    private db: DbService,
    private network: Network,
    private router: Router,
    public formBuilder: FormBuilder,
    private toast: Toast,
    private actRoute: ActivatedRoute
  ) {
    AppConfig.consoleLog('Online DepartmentPage constructor');
    this.device_uuid = localStorage.getItem('device_uuid');
    this.id = this.actRoute.snapshot.paramMap.get('id');
    this.db.getDepartment(this.id).then((res) => {
      this.editForm.setValue({
        dept_name: res['dept_name'],
        dept_password: res['dept_password'],
      });
    });
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      dept_name: new FormControl('', Validators.required),
      dept_password: new FormControl('', Validators.required),
    });
  }

  async saveForm() {
    if (this.networkAvailable) {
      let loader = this.loadingCtrl.create({
        cssClass: 'custom-loader',
        spinner: 'lines-small',
      });
      (await loader).present();

      this.apiService
        .updateDeptTable('modify', [
          {
            department: this.editForm.value.dept_name,
            password: this.editForm.value.dept_password,
          },
        ])
        .then(
          async (res: any) => {
            AppConfig.consoleLog(' success ', res);
            if (res?.status == 'success') {
              this.db
                .updateDepartment(this.id, this.editForm.value)
                .then((res) => {
                  AppConfig.consoleLog('', res);
                  this.router.navigate([`online-department`], {
                    replaceUrl: true,
                  });
                });
            }
            (await loader).dismiss();
          },
          async (err) => {
            AppConfig.consoleLog(' error ', err);
            (await loader).dismiss();
          }
        );
    } else {
      this.toast
        .show(`No internet available`, '2000', 'bottom')
        .subscribe((_) => {});
    }
  }

  goBack() {
    this.router.navigate([`online-department`], { replaceUrl: true });
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
