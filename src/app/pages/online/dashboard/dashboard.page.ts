import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { AppConfig } from '../../../config/appconfig';
import { DbService } from '../../../services/db/db.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private db: DbService,
    private router: Router
  ) {
    AppConfig.consoleLog('DashboardPage constructor');
  }

  ngOnInit() {
    this.db.dbState().subscribe((res) => {
      if (res) {
        let currentDateTime = formatDate(
          new Date(),
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        AppConfig.consoleLog('curr time', currentDateTime);
        this.db.getEventStatus(currentDateTime).then((res) => {
          AppConfig.consoleLog('getEventStatus', res);
          if (res) {
            if (res['event_status'] == 0) {
              this.router.navigate([`online/dashboard-pending`], {
                replaceUrl: true,
              });
            } else if (res['event_status'] == 1) {
              this.router.navigate([`online/dashboard-occupied`], {
                replaceUrl: true,
              });
            }
          } else {
            this.router.navigate([`online/dashboard-available`], {
              replaceUrl: true,
            });
          }
        });
      }
    });
  }

  ionViewDidEnter() {
    AppConfig.consoleLog('DashboardPage ionViewDidEnter');
  }
}
