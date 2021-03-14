import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DepartmentAddPageRoutingModule } from './department-add-routing.module';
import { DepartmentAddPage } from './department-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DepartmentAddPageRoutingModule,
  ],
  declarations: [DepartmentAddPage],
})
export class DepartmentAddPageModule {}
