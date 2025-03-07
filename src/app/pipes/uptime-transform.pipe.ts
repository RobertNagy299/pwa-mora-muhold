import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uptimeTransform',
  standalone: true
})
export class UptimeTransformPipe implements PipeTransform {

  transform(value: number | null): string {
    if(value === null) {
      value = 0;
    }
    const days = Math.floor(value / 86400);
    const remainingSecondsLessThanADay = value % 86400;
    const hours = Math.floor(remainingSecondsLessThanADay / 3600);
    const remainingSecondsLessThanAnHour = remainingSecondsLessThanADay % 3600;
    const minutes = Math.floor(remainingSecondsLessThanAnHour / 60);
    const seconds = Math.floor(remainingSecondsLessThanAnHour % 60);

    return `${days > 0 ? days + ' day' : ''}${days > 1 ? 's' : ''} ${hours > 0 ? hours + ' hour' : ''}${hours > 1 ? 's' : ''}
     ${minutes > 0 ? minutes + ' minute' : ''}${minutes > 1 ? 's' : ''} ${seconds > 0 ? seconds + ' second' : ''}${seconds > 1 ? 's' : ''}` ;
  }

}
