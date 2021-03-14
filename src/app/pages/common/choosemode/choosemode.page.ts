import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../config/appconfig';

@Component({
  selector: 'app-choosemode',
  templateUrl: './choosemode.page.html',
  styleUrls: ['./choosemode.page.scss'],
})
export class ChoosemodePage implements OnInit {
  currentPage: string = 'ChoosemodePage';

  constructor(private router: Router) {}

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
  }

  chooseMode(pmMode) {
    localStorage.setItem('device_mode', pmMode);
    if (pmMode == 'offline') {
      this.router.navigate([`offline-room-details`], { replaceUrl: true });
    } else if (pmMode == 'online') {
      this.router.navigate([`online-room-details`], { replaceUrl: true });
    }
  }
}
