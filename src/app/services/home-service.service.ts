import { Injectable, signal } from '@angular/core';
import { concatMap, filter, interval, Observable, of, switchMap, tap } from 'rxjs';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { ConstantsEnum } from '../utils/constants';
import { IndexedDBService } from './indexed-db.service';
import { UptimeService } from './uptime.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private count = signal(0);
  
  constructor(
    private indexedDBService: IndexedDBService,
    private uptimeService: UptimeService,
  ) {
   // console.log("Created a homeService instance!");
    this.uptimeService.resetCounter$
    .pipe(
      tap(() => {
        this.count.set(0);
      })
    ).subscribe();

    this.indexedDBService.getUpTime().pipe(

      switchMap((upTimeValue) => {
        if (upTimeValue !== null) {
          this.count.set(upTimeValue);
          return of(1)
        } else {
          return of(0)
        }
      }),
      filter(val => val === 0),

      switchMap(() => {
        return this.uptimeService.getCounterValue();
      }),

      switchMap((counterValue) => {
        this.count.set(counterValue);
        return this.indexedDBService.saveUptime(counterValue);
      }),
    ).subscribe()


    this.startIncrementing();


   }


  startIncrementing(): void {
     interval(1000)
    .pipe(
      tap(() => {
       // console.log("Signal is being updated inside the homeService");
        this.count.update(value => value + 1);
      }),
      concatMap(() =>{
        return this.saveCounterValue();
      })

    ).subscribe()
  }

  public getCounterValue(): number {
    return this.count();
  }

  public setCounterValue(newValue: number) {
    this.count.set(newValue);
  }

  saveCounterValue(): Observable<boolean> {
    return this.indexedDBService.saveUptime(this.count())
      .pipe(
        switchMap(() => {
          return fetchWithTimeout(this.uptimeService.saveCounterValue(this.count()), ConstantsEnum.timeoutLimit)
        }),

      )
  }

  
}
