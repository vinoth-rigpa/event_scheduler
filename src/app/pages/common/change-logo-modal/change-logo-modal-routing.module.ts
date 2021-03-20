import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChangeLogoModalPage } from './change-logo-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ChangeLogoModalPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeLogoModalPageRoutingModule {}
