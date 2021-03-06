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
  currentPage: string = 'Offline DashboardPage';
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private db: DbService,
    private router: Router
  ) {}

  ngOnInit() {
    AppConfig.consoleLog(this.currentPage + ' OnInit');
    this.db.dbState().subscribe((res) => {
      if (res) {
        let currentDateTime = formatDate(
          new Date(),
          'yyyy-MM-dd HH:mm',
          this.locale
        );
        this.db.getEventStatus(currentDateTime).then((res) => {
          AppConfig.consoleLog('getEventStatus', res);
          if (res) {
            if (res['event_status'] == 0) {
              this.router.navigate([`offline-dashboard-pending`], {
                replaceUrl: true,
              });
            } else if (res['event_status'] == 1) {
              this.router.navigate([`offline-dashboard-occupied`], {
                replaceUrl: true,
              });
            }
          } else {
            this.router.navigate([`offline-dashboard-available`], {
              replaceUrl: true,
            });
          }
        });
      }
    });
  }
}
