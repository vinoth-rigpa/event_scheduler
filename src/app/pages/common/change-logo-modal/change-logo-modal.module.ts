import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChangeLogoModalPageRoutingModule } from './change-logo-modal-routing.module';
import { ChangeLogoModalPage } from './change-logo-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeLogoModalPageRoutingModule,
  ],
  declarations: [ChangeLogoModalPage],
})
export class ChangeLogoModalPageModule {}
