import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatepipePipe } from './datepipe.pipe';

@NgModule({
  declarations: [DatepipePipe],
  imports: [CommonModule],
  exports: [DatepipePipe],
})
export class DatepipeModule {}
