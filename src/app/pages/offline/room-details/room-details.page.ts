import { Component, OnInit } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Toast } from '@ionic-native/toast/ngx';
import { AppConfig } from '../../../config/appconfig';
import { DbService } from '../../../services/db/db.service';

@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.page.html',
  styleUrls: ['./room-details.page.scss'],
})
export class RoomDetailsPage implements OnInit {
  currentPage: string = 'Offline RoomDetailsPage';
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
    private db: DbService,
    private router: Router,
    private toast: Toast,
    public formBuilder: FormBuilder
  ) {
    this.device_uuid = localStorage.getItem('device_uuid');
  }

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
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
    this.router.navigate([`offline-dashboard`], { replaceUrl: true });
  }

  storeData() {
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
        this.room_details_form.reset();
        this.toast
          .show(`Room details added`, '2000', 'bottom')
          .subscribe((_) => {});
        this.router.navigate([`offline-dashboard`], { replaceUrl: true });
      });
  }
}
