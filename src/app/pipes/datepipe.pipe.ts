import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datepipe',
})
export class DatepipePipe implements PipeTransform {
  transform(timeString: string) {
    let time;
    time = timeString
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [timeString];
    if (time.length > 1) {
      // If time format correct
      time = time.slice(1); // Remove full string match value
      time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
      time[3] = ' ';
      time[4] = ' ';
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join('');
  }
}
