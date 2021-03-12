import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DepartmentAddPage } from './department-add.page';

const routes: Routes = [
  {
    path: '',
    component: DepartmentAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DepartmentAddPageRoutingModule {}
