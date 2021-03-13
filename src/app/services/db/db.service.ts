import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Department } from '../../models/department';
import { DeviceCodes } from '../../models/device-codes';
import { DeviceConfig } from '../../models/device-config';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Event } from '../../models/event';
import { AppConfig } from '../../config/appconfig';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private storage: SQLiteObject;
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter
  ) {
    this.platform.ready().then(() => {
      this.sqlite
        .create({
          name: 'roomscheduler.db',
          location: 'default',
        })
        .then((db: SQLiteObject) => {
          this.storage = db;
          AppConfig.consoleLog('db => ', this.storage);
          this.httpClient
            .get('assets/db/dump.sql', { responseType: 'text' })
            .subscribe((data) => {
              this.sqlPorter
                .importSqlToDb(this.storage, data)
                .then((_) => {
                  this.isDbReady.next(true);
                })
                .catch((error) => {
                  console.error(error);
                });
            });
        });
    });
  }

  dbState() {
    return this.isDbReady.asObservable();
  }

  // Get list
  getDepartments(): Promise<Department[]> {
    return this.storage
      .executeSql('SELECT * FROM departments', [])
      .then((res) => {
        let items: Department[] = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            items.push({
              id: res.rows.item(i).id,
              dept_name: res.rows.item(i).dept_name,
              dept_password: res.rows.item(i).dept_password,
            });
          }
        }
        return items;
      });
  }

  // Add
  addDepartment(dept_name, dept_password) {
    let data = [dept_name, dept_password];
    return this.storage
      .executeSql(
        'INSERT INTO departments (dept_name, dept_password) VALUES (TRIM(?), ?)',
        data
      )
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  // Get single object
  getDepartment(id): Promise<Department> {
    return this.storage
      .executeSql('SELECT * FROM departments WHERE id = ?', [id])
      .then((res) => {
        return {
          id: res.rows.item(0).id,
          dept_name: res.rows.item(0).dept_name,
          dept_password: res.rows.item(0).dept_password,
        };
      });
  }

  checkDepartmentExists(dept_name): Promise<Department> {
    return this.storage
      .executeSql(
        'SELECT * FROM departments WHERE TRIM(LOWER(dept_name)) = TRIM(LOWER(?))',
        [dept_name]
      )
      .then((res) => {
        if (res.rows.length > 0) {
          return {
            id: res.rows.item(0).id,
            dept_name: res.rows.item(0).dept_name,
            dept_password: res.rows.item(0).dept_password,
          };
        } else {
          return null;
        }
      });
  }

  // Update
  updateDepartment(id, department: Department) {
    let data = [department.dept_name, department.dept_password];
    return this.storage
      .executeSql(
        `UPDATE departments SET dept_name = ?, dept_password = ? WHERE id = ${id}`,
        data
      )
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  // Delete
  deleteDepartment(id) {
    return this.storage
      .executeSql('DELETE FROM departments WHERE id = ?', [id])
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  // Get single object
  verifyDepartmentPassword(dept_name, dept_password): Promise<Department> {
    return this.storage
      .executeSql(
        'SELECT * FROM departments WHERE dept_name = ? AND dept_password = ?',
        [dept_name, dept_password]
      )
      .then(
        (res) => {
          if (res.rows.length > 0) {
            return {
              id: res.rows.item(0).id,
              dept_name: res.rows.item(0).dept_name,
              dept_password: res.rows.item(0).dept_password,
            };
          } else {
            return null;
          }
        },
        (err) => {
          AppConfig.consoleLog('error', err);
          return null;
        }
      );
  }

  changeRoomPassword(new_password) {
    return this.storage
      .executeSql(`UPDATE device_config SET room_password = ?`, [new_password])
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  changeRoomName(name) {
    return this.storage
      .executeSql(`UPDATE device_config SET room_name = ?`, [name])
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  // Add
  addRoomDetails(uuid, room_id, room_name, room_password) {
    let data = [uuid, room_id, room_name, room_password];
    return this.storage
      .executeSql(
        'INSERT INTO device_config (uuid, room_id, room_name, room_password) VALUES (?, ?,?, ?)',
        data
      )
      .then((res) => {
        AppConfig.consoleLog('Room details added', res);
      });
  }

  // Get single object
  getRoomDetail(uuid): Promise<DeviceConfig> {
    return this.storage
      .executeSql('SELECT * FROM device_config WHERE uuid = ?', [uuid])
      .then((res) => {
        return {
          id: res.rows.item(0).id,
          uuid: res.rows.item(0).uuid,
          room_id: res.rows.item(0).room_id,
          room_name: res.rows.item(0).room_name,
          room_password: res.rows.item(0).room_password,
        };
      });
  }

  // Get single object
  checkActiveCode(uuid): Promise<DeviceCodes> {
    return this.storage
      .executeSql('SELECT * FROM device_codes WHERE uuid = ?', [uuid])
      .then(
        (res) => {
          if (res.rows.length > 0) {
            return {
              id: res.rows.item(0).id,
              uuid: res.rows.item(0).uuid,
              activation_code: res.rows.item(0).activation_code,
            };
          } else {
            return null;
          }
        },
        (err) => {
          AppConfig.consoleLog('error', err);
          return null;
        }
      );
  }

  // Get list
  getEvents(pmDate) {
    return this.storage
      .executeSql(
        "SELECT * FROM events WHERE strftime('%s', start_datetime) > strftime('%s', ?)",
        [pmDate]
      )
      .then((res) => {
        let items: Event[] = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            items.push({
              id: res.rows.item(i).id,
              event_id: res.rows.item(i).event_id,
              event_name: res.rows.item(i).event_name,
              dept_name: res.rows.item(i).dept_name,
              organizer: res.rows.item(i).organizer,
              start_datetime: res.rows.item(i).start_datetime,
              end_datetime: res.rows.item(i).end_datetime,
              dept_password: res.rows.item(i).dept_password,
              event_status: res.rows.item(i).event_status,
              sync_status: res.rows.item(i).sync_status,
            });
          }
        }
        return items;
      });
  }

  getEventsByDate(pmDate, currentDateTime) {
    return this.storage
      .executeSql(
        "SELECT * FROM events WHERE (strftime('%s', start_datetime) > strftime('%s', ?) AND strftime('%Y-%m-%d', start_datetime) = strftime('%Y-%m-%d', ?))",
        [currentDateTime, pmDate]
      )
      .then((res) => {
        let items: Event[] = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            items.push({
              id: res.rows.item(i).id,
              event_id: res.rows.item(i).event_id,
              event_name: res.rows.item(i).event_name,
              dept_name: res.rows.item(i).dept_name,
              organizer: res.rows.item(i).organizer,
              start_datetime: res.rows.item(i).start_datetime,
              end_datetime: res.rows.item(i).end_datetime,
              dept_password: res.rows.item(i).dept_password,
              event_status: res.rows.item(i).event_status,
              sync_status: res.rows.item(i).sync_status,
            });
          }
        }
        return items;
      });
  }

  getNextEvent(currentDateTime) {
    return this.storage
      .executeSql(
        "SELECT * FROM events WHERE strftime('%s', start_datetime) > strftime('%s', ?) ORDER BY strftime('%s', start_datetime) ASC LIMIT 1;",
        [currentDateTime]
      )
      .then((res) => {
        if (res.rows.length > 0) {
          return {
            id: res.rows.item(0).id,
            event_id: res.rows.item(0).event_id,
            event_name: res.rows.item(0).event_name,
            dept_name: res.rows.item(0).dept_name,
            organizer: res.rows.item(0).organizer,
            start_datetime: res.rows.item(0).start_datetime,
            end_datetime: res.rows.item(0).end_datetime,
            dept_password: res.rows.item(0).dept_password,
            event_status: res.rows.item(0).event_status,
            sync_status: res.rows.item(0).sync_status,
          };
        } else {
          return null;
        }
      });
  }

  // Add
  addEvent(event: Event) {
    let data = [
      event.event_id,
      event.event_name,
      event.dept_name,
      event.organizer,
      event.start_datetime,
      event.end_datetime,
      event.dept_password,
    ];
    return this.storage
      .executeSql(
        'INSERT INTO events (event_id, event_name,dept_name,organizer,start_datetime,end_datetime,dept_password) VALUES (?, ?, ?, ?, ?, ?, ?)',
        data
      )
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  bookEvent(event: Event) {
    let data = [
      event.event_id,
      event.event_name,
      event.dept_name,
      event.organizer,
      event.start_datetime,
      event.end_datetime,
      event.dept_password,
      1,
    ];
    return this.storage
      .executeSql(
        'INSERT INTO events (event_id, event_name,dept_name,organizer,start_datetime,end_datetime,dept_password,event_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        data
      )
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  // Get single object
  getEvent(id): Promise<Event> {
    AppConfig.consoleLog('getEvent', id);
    return this.storage
      .executeSql('SELECT * FROM events WHERE id = ?', [id])
      .then((res) => {
        return {
          id: res.rows.item(0).id,
          event_id: res.rows.item(0).event_id,
          event_name: res.rows.item(0).event_name,
          dept_name: res.rows.item(0).dept_name,
          organizer: res.rows.item(0).organizer,
          start_datetime: res.rows.item(0).start_datetime,
          end_datetime: res.rows.item(0).end_datetime,
          dept_password: res.rows.item(0).dept_password,
          event_status: res.rows.item(0).event_status,
          sync_status: res.rows.item(0).sync_status,
        };
      });
  }

  // Update
  updateEvent(id, event: Event) {
    let data = [
      event.event_id,
      event.event_name,
      event.dept_name,
      event.organizer,
      event.start_datetime,
      event.end_datetime,
      event.dept_password,
    ];
    return this.storage
      .executeSql(
        `UPDATE events SET event_id = ?, event_name = ?,dept_name = ?,organizer = ?,start_datetime = ?,end_datetime = ?,dept_password = ? WHERE id = ${id}`,
        data
      )
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  // Delete
  deleteEvent(id) {
    return this.storage
      .executeSql('DELETE FROM events WHERE id = ?', [id])
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  getLastEventID(): Promise<Event> {
    return this.storage
      .executeSql('SELECT * FROM events ORDER BY id DESC LIMIT 1', [])
      .then((res) => {
        AppConfig.consoleLog('res', res.rows.item(0));
        if (res.rows.length > 0) {
          return {
            id: res.rows.item(0).id,
            event_id: res.rows.item(0).event_id,
            event_name: res.rows.item(0).event_name,
            dept_name: res.rows.item(0).dept_name,
            organizer: res.rows.item(0).organizer,
            start_datetime: res.rows.item(0).start_datetime,
            end_datetime: res.rows.item(0).end_datetime,
            dept_password: res.rows.item(0).dept_password,
            event_status: res.rows.item(0).event_status,
            sync_status: res.rows.item(0).sync_status,
          };
        }
      });
  }

  updateEventStatus(id) {
    return this.storage
      .executeSql(`UPDATE events SET event_status = 1 WHERE id = ${id}`, [])
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  releaseEventStatus(id, pmEndDate) {
    return this.storage
      .executeSql(
        `UPDATE events SET event_status = 2,end_datetime=?  WHERE id = ${id}`,
        [pmEndDate]
      )
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  extendEventStatus(id, pmEndDate) {
    return this.storage
      .executeSql(
        `UPDATE events SET event_status = 1,end_datetime=?  WHERE id = ${id}`,
        [pmEndDate]
      )
      .then((res) => {
        AppConfig.consoleLog('res', res);
      });
  }

  checkEventExists(pmStartDatetime, pmEndDatetime): Promise<Event> {
    AppConfig.consoleLog('strftime ', pmStartDatetime + ' ' + pmEndDatetime);
    return this.storage
      .executeSql(
        "SELECT * FROM events WHERE event_status != 2 AND (((strftime('%s', ?) BETWEEN strftime('%s', start_datetime) AND  strftime('%s', end_datetime)) OR (strftime('%s', ?) BETWEEN strftime('%s', start_datetime) AND  strftime('%s', end_datetime)) OR (strftime('%s', start_datetime) BETWEEN strftime('%s', ?) AND  strftime('%s', ?)) OR (strftime('%s', end_datetime) BETWEEN strftime('%s', ?) AND  strftime('%s', ?))))",
        [
          pmStartDatetime,
          pmEndDatetime,
          pmStartDatetime,
          pmEndDatetime,
          pmStartDatetime,
          pmEndDatetime,
        ]
      )
      .then((res) => {
        AppConfig.consoleLog('res', res.rows.item(0));
        if (res.rows.length > 0) {
          return {
            id: res.rows.item(0).id,
            event_id: res.rows.item(0).event_id,
            event_name: res.rows.item(0).event_name,
            dept_name: res.rows.item(0).dept_name,
            organizer: res.rows.item(0).organizer,
            start_datetime: res.rows.item(0).start_datetime,
            end_datetime: res.rows.item(0).end_datetime,
            dept_password: res.rows.item(0).dept_password,
            event_status: res.rows.item(0).event_status,
            sync_status: res.rows.item(0).sync_status,
          };
        }
      });
  }

  checkEventExistsonEdit(
    eventId,
    pmStartDatetime,
    pmEndDatetime
  ): Promise<Event> {
    AppConfig.consoleLog(
      'strftime ',
      eventId + ' ' + pmStartDatetime + ' ' + pmEndDatetime
    );
    return this.storage
      .executeSql(
        "SELECT * FROM events WHERE event_id != ? AND event_status != 2 AND (((strftime('%s', ?) BETWEEN strftime('%s', start_datetime) AND  strftime('%s', end_datetime)) OR (strftime('%s', ?) BETWEEN strftime('%s', start_datetime) AND  strftime('%s', end_datetime)) OR (strftime('%s', start_datetime) BETWEEN strftime('%s', ?) AND  strftime('%s', ?)) OR (strftime('%s', end_datetime) BETWEEN strftime('%s', ?) AND  strftime('%s', ?))))",
        [
          eventId,
          pmStartDatetime,
          pmEndDatetime,
          pmStartDatetime,
          pmEndDatetime,
          pmStartDatetime,
          pmEndDatetime,
        ]
      )
      .then((res) => {
        AppConfig.consoleLog('res', res.rows.item(0));
        if (res.rows.length > 0) {
          return {
            id: res.rows.item(0).id,
            event_id: res.rows.item(0).event_id,
            event_name: res.rows.item(0).event_name,
            dept_name: res.rows.item(0).dept_name,
            organizer: res.rows.item(0).organizer,
            start_datetime: res.rows.item(0).start_datetime,
            end_datetime: res.rows.item(0).end_datetime,
            dept_password: res.rows.item(0).dept_password,
            event_status: res.rows.item(0).event_status,
            sync_status: res.rows.item(0).sync_status,
          };
        }
      });
  }

  getEventStatus(pmDatetime): Promise<Event> {
    AppConfig.consoleLog('strftime', pmDatetime);
    return this.storage
      .executeSql(
        "SELECT * FROM events WHERE event_status != 2 AND (strftime('%s', ?) = strftime('%s', start_datetime) OR strftime('%s', ?) BETWEEN strftime('%s', start_datetime) AND  strftime('%s', end_datetime))",
        [pmDatetime, pmDatetime]
      )
      .then((res) => {
        AppConfig.consoleLog('res', res.rows.item(0));
        if (res.rows.length > 0) {
          return {
            id: res.rows.item(0).id,
            event_id: res.rows.item(0).event_id,
            event_name: res.rows.item(0).event_name,
            dept_name: res.rows.item(0).dept_name,
            organizer: res.rows.item(0).organizer,
            start_datetime: res.rows.item(0).start_datetime,
            end_datetime: res.rows.item(0).end_datetime,
            dept_password: res.rows.item(0).dept_password,
            event_status: res.rows.item(0).event_status,
            sync_status: res.rows.item(0).sync_status,
          };
        }
      });
  }

  getUpcomingEventsByDate(pmDate) {
    return this.storage
      .executeSql(
        "SELECT * FROM events WHERE event_status != 2 AND (strftime('%s', start_datetime) > strftime('%s', ?) OR (strftime('%s', ?) BETWEEN strftime('%s', start_datetime) AND  strftime('%s', end_datetime))) ORDER BY strftime('%s', start_datetime) ASC",
        [pmDate, pmDate]
      )
      .then((res) => {
        let items: Event[] = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            items.push({
              id: res.rows.item(i).id,
              event_id: res.rows.item(i).event_id,
              event_name: res.rows.item(i).event_name,
              dept_name: res.rows.item(i).dept_name,
              organizer: res.rows.item(i).organizer,
              start_datetime: res.rows.item(i).start_datetime,
              end_datetime: res.rows.item(i).end_datetime,
              dept_password: res.rows.item(i).dept_password,
              event_status: res.rows.item(i).event_status,
              sync_status: res.rows.item(i).sync_status,
            });
          }
        }
        return items;
      });
  }
}
