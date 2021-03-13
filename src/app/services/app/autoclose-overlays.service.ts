import { Injectable, ViewChildren, QueryList } from '@angular/core';
import {
  IonRouterOutlet,
  ActionSheetController,
  PopoverController,
  ModalController,
  MenuController,
  ToastController,
} from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AutocloseOverlaysService {
  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    private menu: MenuController,
    private router: Router,
    private toastController: ToastController
  ) {}
  async trigger() {
    AppConfig.consoleLog('backbutton triggered');
    // close action sheet
    try {
      const element = await this.actionSheetCtrl.getTop();
      if (element) {
        element.dismiss();
        return;
      }
    } catch (error) {}

    // close popover
    try {
      const element = await this.popoverCtrl.getTop();
      if (element) {
        element.dismiss();
        return;
      }
    } catch (error) {}

    // close modal
    try {
      const element = await this.modalCtrl.getTop();
      if (element) {
        element.dismiss();
        return;
      }
    } catch (error) {
      AppConfig.consoleLog(error);
    }

    // close side menua
    try {
      const element = await this.menu.getOpen();
      if (element !== null) {
        this.menu.close();
        return;
      }
    } catch (error) {}
  }
}
