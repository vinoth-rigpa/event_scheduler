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
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {
  currentPage: string = 'ChangePasswordPage';
  mainForm: FormGroup;
  validation_messages = {
    current_password: [
      { type: 'required', message: 'Current Password is required.' },
    ],
    new_password: [{ type: 'required', message: 'New password is required.' }],
    confirm_password: [
      { type: 'required', message: 'Confirm password is required.' },
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
    this.mainForm = this.formBuilder.group(
      {
        current_password: new FormControl('', Validators.required),
        new_password: new FormControl('', Validators.required),
        confirm_password: new FormControl('', Validators.required),
      },
      {
        validators: this.password.bind(this),
      }
    );
  }

  password(formGroup: FormGroup) {
    const { value: new_password } = formGroup.get('new_password');
    const { value: confirm_password } = formGroup.get('confirm_password');
    return new_password === confirm_password
      ? null
      : { passwordNotMatch: true };
  }

  changePassword() {
    this.db.changeRoomPassword(this.mainForm.value.new_password).then((res) => {
      localStorage.setItem('device_password', this.mainForm.value.new_password);
      this.mainForm.reset();
      this.toast
        .show(AppConfig.RESET_PASSWORD_SUCCESS_MSG, '2000', 'bottom')
        .subscribe((_) => {});
    });
  }

  goBack() {
    this.router.navigate([`offline-settings`], { replaceUrl: true });
  }
}
