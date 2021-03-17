import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivationPageRoutingModule } from './activation-routing.module';
import { ActivationPage } from './activation.page';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ActivationPageRoutingModule,
    QRCodeModule,
  ],
  declarations: [ActivationPage],
})
export class ActivationPageModule {}
