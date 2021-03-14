import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';
import { Device } from '@ionic-native/device/ngx';
import { AppConfig } from '../../config/appconfig';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  os_type: any;
  app_version: any;
  os_version: any;
  device_uuid: any;
  device_brand: any;
  device_model: any;
  os_name: any;

  GET_TIME = 'getTime';
  REGISTER_DEVICE_CONFIG = 'registerDeviceConfig';
  SET_EVENT_TABLE = 'setEventTable';
  GET_EVENT_TABLE = 'getEventTable';
  UPDATE_EVENT_TABLE = 'updateEventTable';
  UPDATE_DEPT_TABLE = 'updateDeptTable';
  GET_DEPT_LIST = 'getDeptList';
  CHANGE_ROOM_NAME = 'changeDeviceConfig';
  apiUrl: string;

  constructor(
    public http: HTTP,
    public platform: Platform,
    private device: Device
  ) {
    this.platform.ready().then(() => {
      this.app_version = AppConfig.APP_VERSION;
      if (this.platform.is('android')) {
        this.os_type = 'android';
      }
      if (this.platform.is('ios')) {
        this.os_type = 'ios';
      }
      this.os_version = this.device.version;
      this.os_name = this.device.platform;
      this.device_brand = this.device.manufacturer;
      this.device_model = this.device.model;
      this.device_uuid = this.device.uuid;
    });
  }

  IsJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  get(path, baseUrl: String = '') {
    return new Promise((resolve, reject) => {
      this.apiUrl = localStorage.getItem('api_url') + AppConfig.API_BASE_URL;
      let apiURL = this.apiUrl + path;
      if (baseUrl != '') {
        apiURL = baseUrl + AppConfig.API_BASE_URL + path;
      }
      AppConfig.consoleLog('API_URL-->', apiURL);
      this.http.get(apiURL, {}, {}).then(
        (res) => {
          AppConfig.consoleLog(
            'API_OUTPUT_DATA ' + this.IsJsonString(res.data) + ' --> ',
            JSON.stringify(res.data)
          );
          if (this.IsJsonString(res.data)) {
            resolve(JSON.parse(res.data));
          } else {
            resolve(res.data);
          }
        },
        (err) => {
          AppConfig.consoleLog('API_CALL_ERROR-->', JSON.stringify(err));
          reject(err);
        }
      );
    });
  }

  post(inputdata, path, authtoken = '') {
    return new Promise((resolve, reject) => {
      this.http.setDataSerializer('json');
      this.apiUrl = localStorage.getItem('api_url') + AppConfig.API_BASE_URL;
      AppConfig.consoleLog('API_URL-->', this.apiUrl + path);
      AppConfig.consoleLog('API_INPUT_DATA-->', JSON.stringify(inputdata));
      if (authtoken != '') {
        this.http
          .post(this.apiUrl + path, inputdata, {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + authtoken + '',
          })
          .then(
            (res) => {
              AppConfig.consoleLog(
                'API_OUTPUT_DATA ' + this.IsJsonString(res.data) + ' --> ',
                JSON.stringify(res.data)
              );
              if (this.IsJsonString(res.data)) {
                resolve(JSON.parse(res.data));
              } else {
                resolve(res.data);
              }
            },
            (err) => {
              AppConfig.consoleLog('API_CALL_ERROR-->', JSON.stringify(err));
              reject(err);
            }
          );
      } else {
        this.http
          .post(this.apiUrl + path, inputdata, {
            'Content-Type': 'application/json',
          })
          .then(
            (res) => {
              AppConfig.consoleLog(
                'API_OUTPUT_DATA ' + this.IsJsonString(res.data) + ' --> ',
                JSON.stringify(res.data)
              );
              if (this.IsJsonString(res.data)) {
                resolve(JSON.parse(res.data));
              } else {
                resolve(res.data);
              }
            },
            (err) => {
              AppConfig.consoleLog('API_CALL_ERROR-->', JSON.stringify(err));
              reject(err);
            }
          );
      }
    });
  }

  getTime(url) {
    return new Promise((resolve, reject) => {
      this.get(this.GET_TIME, url).then(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  registerDeviceConfig(roomName, roomID) {
    return new Promise((resolve, reject) => {
      this.post(
        {
          UUID: this.device_uuid,
          roomName: roomName,
          roomID: roomID,
        },
        this.REGISTER_DEVICE_CONFIG
      ).then(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  setEventTable(roomName, roomID, schedule) {
    return new Promise((resolve, reject) => {
      this.post(
        {
          UUID: this.device_uuid,
          roomName: roomName,
          roomID: roomID,
          schedule: schedule,
        },
        this.SET_EVENT_TABLE
      ).then(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  getEventTable(roomName, roomID) {
    return new Promise((resolve, reject) => {
      this.post(
        {
          UUID: this.device_uuid,
          roomName: roomName,
          roomID: roomID,
        },
        this.GET_EVENT_TABLE
      ).then(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  updateEventTable(action, roomName, roomID, schedule) {
    return new Promise((resolve, reject) => {
      this.post(
        {
          action: action,
          UUID: this.device_uuid,
          roomName: roomName,
          roomID: roomID,
          schedule: schedule,
        },
        this.UPDATE_EVENT_TABLE
      ).then(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  updateDeptTable(action, departmentList) {
    return new Promise((resolve, reject) => {
      this.post(
        {
          action: action,
          departmentList: departmentList,
        },
        this.UPDATE_DEPT_TABLE
      ).then(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  getDeptList() {
    return new Promise((resolve, reject) => {
      this.get(this.GET_DEPT_LIST).then(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  changeRoomName(roomName, roomID) {
    return new Promise((resolve, reject) => {
      this.post(
        {
          UUID: this.device_uuid,
          roomName: roomName,
          roomID: roomID,
        },
        this.CHANGE_ROOM_NAME
      ).then(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
}
