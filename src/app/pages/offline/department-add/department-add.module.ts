import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DepartmentAddPageRoutingModule } from './department-add-routing.module';

import { DepartmentAddPage } from './department-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DepartmentAddPageRoutingModule
  ],
  declarations: [DepartmentAddPage]
})
export class DepartmentAddPageModule {}
