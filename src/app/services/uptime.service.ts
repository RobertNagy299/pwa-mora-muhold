import { inject, Injectable } from '@angular/core';

import { Database, ref, set, get, DataSnapshot } from '@angular/fire/database';
import { catchError, from, map, mergeMap, Observable, of, tap } from 'rxjs';
import { IndexedDBService } from './indexed-db.service';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { ConstantsEnum } from '../utils/constants';
import { MyStoreInterface } from '../store/app.store';
import { select, Store } from '@ngrx/store';
import { selectUptime } from '../store/uptimeCounterFeature/uptimeCounterFeature.selectors';

@Injectable({
  providedIn: 'root'
})
//  Uptime is a Singleton document
export class UptimeService {

  private db: Database = inject(Database);
  

 
  constructor(
    private readonly indexedDBService: IndexedDBService,
    private readonly store: Store<MyStoreInterface>,

  ) { 

    this.store.pipe(select(selectUptime)).pipe(
      tap((uptime: number) => {
        return this.saveCounterValue(uptime);
      })
    )

  }



  // Save the counter value in Realtime Database

  public saveCounterValue(seconds: number): Observable<boolean> {
   
    //console.log('Data = ', seconds);
    return fetchWithTimeout(
      from(set(ref(this.db, ConstantsEnum.uptimeObjectStoreName), seconds)),
      ConstantsEnum.timeoutLimit
    ).pipe(
      //tap(() => console.log('kaka in fetch')),
      mergeMap(() => {
        return this.indexedDBService.saveUptime(seconds);
      }),

      catchError((err) => {
        console.error("Error saving uptime to Firebase Realtime Database: " + err.message);
        return of(false)
      })

    )

  }

// backendHandler implements IBackend  {


//}

// {provide: IBackend, useValue: fireBaseBackend}
// {provide: IBackend, useValue: idbBaseBackend}
// {provide: IBackend, useValue: javaBaseBackend}

  // Get the counter value from Realtime Database

  public getCounterValue(): Observable<number> {

    return fetchWithTimeout(
      from(get(ref(this.db, ConstantsEnum.uptimeObjectStoreName))),
      ConstantsEnum.timeoutLimit)
      .pipe(
        map((snapshot: DataSnapshot) => {
          return snapshot.val();
        }),

        catchError((err) => {
          // unknown error: err.message is undefined on every single app restart
          console.error(`ERror when fetching uptime from firebase ${err.messsage}`);
          return this.indexedDBService.getUpTime()

        })
      )

  }
}
