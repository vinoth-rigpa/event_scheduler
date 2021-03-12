import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChoosemodePage } from './choosemode.page';

const routes: Routes = [
  {
    path: '',
    component: ChoosemodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChoosemodePageRoutingModule {}
