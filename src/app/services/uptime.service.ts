import {inject, Injectable} from '@angular/core';

import { Database, ref, set, get, DataSnapshot } from '@angular/fire/database';
import {catchError, forkJoin, from, map, mergeMap, Observable, of, Subject} from 'rxjs';
import {IndexedDBService} from './indexed-db.service';
import {fetchWithTimeout} from '../utils/fetchWithTimeout';
import {ConstantsEnum}  from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
//  Uptime is a Singleton document
export class UptimeService {

  private db: Database = inject(Database);
  private resetCounterSubject = new Subject<void>();


  constructor(private indexedDBService: IndexedDBService) {}


 
  // Save the counter value in Realtime Database

  public saveCounterValue(seconds: number): Observable<boolean> {
    return   fetchWithTimeout(
        from(set(ref(this.db, ConstantsEnum.uptimeObjectStoreName), seconds)),
        ConstantsEnum.timeoutLimit
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

  // Reset counter
 

  public resetUptimeCounter(): Observable<boolean> {
    this.resetCounterSubject.next()
    return this.saveCounterValue(0);
  }

  // Get the reset counter observable
  get resetCounter$() {
    return this.resetCounterSubject.asObservable();
  }




  // Get the counter value from Realtime Database

  // OLD VERSION, WORKS FINE

  public getCounterValue(): Observable<number> {
    return fetchWithTimeout(
        from( get(ref(this.db, ConstantsEnum.uptimeObjectStoreName))), 
        ConstantsEnum.timeoutLimit)
    .pipe(
      map((snapshot: DataSnapshot) => {
        return snapshot.val();
      }),

      catchError((err) => {
        console.error(`ERror when fetching uptime from firebase ${err.messsage}`);
        return this.indexedDBService.getUpTime()
      
      })
    )  

  }
}
