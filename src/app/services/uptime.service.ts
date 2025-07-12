import { inject, Injectable } from '@angular/core';

import { Database, ref, set, get, DataSnapshot } from '@angular/fire/database';
import { catchError, from, map, mergeMap, Observable, of } from 'rxjs';
import { IndexedDBService } from './indexed-db.service';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { Constants } from '../utils/constants';
import { MyStoreInterface } from '../store/app.store';
import { select, Store } from '@ngrx/store';
import { selectUptime } from '../store/uptime-counter-features/uptimeCounterFeature.selectors';
import { loadUptime, startIncrementing } from '../store/uptime-counter-features/uptimeCounterFeature.actions';

@Injectable({
  providedIn: 'root'
})
export class UptimeService {

  private db: Database = inject(Database);
  public uptimeValue$?: Observable<number>;

  constructor(
    private readonly indexedDBService: IndexedDBService,
    private readonly store: Store<MyStoreInterface>,
  ) { }

  public init(): void {
    this.store.dispatch(loadUptime());
    this.store.dispatch(startIncrementing());
    this.uptimeValue$ = this.store.pipe(select(selectUptime));
  }

  public resetCounterValue(): Observable<boolean> {
    return this.saveCounterValue(0);
  }

  // Save the counter value in Realtime Database
  public saveCounterValue(seconds: number): Observable<boolean> {
    return fetchWithTimeout(
      from(set(ref(this.db, Constants.get('uptimeObjectStoreName')), seconds)),
      Constants.get('timeoutLimit')
    ).pipe(
      mergeMap(() => {
        return this.indexedDBService.saveUptime(seconds);
      }),
      catchError((err) => {
        console.error("Error saving uptime to Firebase Realtime Database: " + err.message);
        return of(false)
      })
    )
  }

  // Get the counter value from Realtime Database
  public getCounterValue(): Observable<number> {
    return fetchWithTimeout(
      from(get(ref(this.db, Constants.get('uptimeObjectStoreName')))),
      Constants.get('timeoutLimit'))
      .pipe(
        map((snapshot: DataSnapshot) => {
          return snapshot.val();
        }),
        catchError((err) => {
          console.error(`Error when fetching uptime from firebase ${err.messsage}`);
          return this.indexedDBService.getUpTime()
        })
      )
  }
}
