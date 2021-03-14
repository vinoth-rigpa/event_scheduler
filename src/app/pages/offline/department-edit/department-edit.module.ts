import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DepartmentEditPageRoutingModule } from './department-edit-routing.module';
import { DepartmentEditPage } from './department-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DepartmentEditPageRoutingModule,
  ],
  declarations: [DepartmentEditPage],
})
export class DepartmentEditPageModule {}
