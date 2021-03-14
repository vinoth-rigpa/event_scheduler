import { Component, OnInit } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { DbService } from '../../../services/db/db.service';
import { Router } from '@angular/router';
import { Toast } from '@ionic-native/toast/ngx';
import { AppConfig } from '../../../config/appconfig';

@Component({
  selector: 'app-department-add',
  templateUrl: './department-add.page.html',
  styleUrls: ['./department-add.page.scss'],
})
export class DepartmentAddPage implements OnInit {
  currentPage: string = 'Offline DepartmentAddPage';
  mainForm: FormGroup;
  validation_messages = {
    dept_name: [{ type: 'required', message: 'Department name is required.' }],
    dept_password: [
      { type: 'required', message: 'Department password is required.' },
    ],
  };

  constructor(
    private db: DbService,
    public formBuilder: FormBuilder,
    private toast: Toast,
    private router: Router
  ) {}

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
    this.mainForm = this.formBuilder.group({
      dept_name: new FormControl('', Validators.required),
      dept_password: new FormControl('', Validators.required),
    });
  }

  storeData() {
    this.db
      .checkDepartmentExists(this.mainForm.value.dept_name)
      .then(async (res) => {
        AppConfig.consoleLog('endDateTime', res);
        if (res) {
          this.toast
            .show(`Department Name already exists.`, '2000', 'bottom')
            .subscribe((_) => {});
        } else {
          this.db
            .addDepartment(
              this.mainForm.value.dept_name,
              this.mainForm.value.dept_password
            )
            .then((res) => {
              this.mainForm.reset();
              this.router.navigate([`offline-department`], {
                replaceUrl: true,
              });
            });
        }
      });
  }

  goBack() {
    this.router.navigate([`offline-department`], { replaceUrl: true });
  }
}
