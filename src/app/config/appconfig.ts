export class AppConfig {
  public static currentEnvironment: string = 'development';
  public static API_BASE_URL = '/emsol/';
  public static SITE_URL = 'http://emsolautomation.com/';
  public static APP_ID = 'com.emsolautomation.eventscheduler';
  public static APP_VERSION = '1.0.0';
  public static API_ERROR =
    'Please check your internet connection or Try after some time.';
  public static UNKONWN_ERROR =
    'Internet connection unavailable. Please try after sometime.';
  public static UNKONWN_ERROR_HEADING = "Can't connect to the internet";
  public static consoleLog(pmMsg = '', pmObj = null) {
    console.log(
      new Date().getHours() +
        ':' +
        new Date().getMinutes() +
        ':' +
        new Date().getSeconds() +
        ':' +
        new Date().getMilliseconds() +
        '\n',
      pmMsg,
      ' ## ',
      pmObj
    );
  }
}
