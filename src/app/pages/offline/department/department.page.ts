import { Component, OnInit } from '@angular/core';
import { DbService } from '../../../services/db/db.service';
import { Toast } from '@ionic-native/toast/ngx';
import { Router } from '@angular/router';
import { AppConfig } from '../../../config/appconfig';
import { AlertController } from '@ionic/angular';
import { Department } from 'src/app/models/department';
@Component({
  selector: 'app-department',
  templateUrl: './department.page.html',
  styleUrls: ['./department.page.scss'],
})
export class DepartmentPage implements OnInit {
  departmentData: Department[] = [];
  constructor(
    private db: DbService,
    private toast: Toast,
    private router: Router,
    public alertController: AlertController
  ) {}
  ngOnInit() {
    this.db.dbState().subscribe((res) => {
      if (res) {
        this.db.getDepartments().then((item) => {
          this.departmentData = item;
        });
      }
    });
  }
  async deleteDepartment(id) {
    AppConfig.consoleLog(id);
    const alert = await this.alertController.create({
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
    this.router.navigate([`offline/department-add`], { replaceUrl: true });
  }
  goBack() {
    this.router.navigate([`offline/settings`], { replaceUrl: true });
  }
}
