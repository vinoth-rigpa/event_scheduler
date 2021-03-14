import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChoosemodePageRoutingModule } from './choosemode-routing.module';
import { ChoosemodePage } from './choosemode.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChoosemodePageRoutingModule,
  ],
  declarations: [ChoosemodePage],
})
export class ChoosemodePageModule {}
