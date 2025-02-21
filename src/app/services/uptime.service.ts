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
 
  // OLD VERSION  - WORKS FINE

  // public async saveCounterValue(seconds: number): Promise<void> {
  //   const counterRef = ref(this.db, ConstantsEnum.uptimeObjectStoreName);  // The path to store the counter value
  //   try {
  //     await fetchWithTimeout( set(counterRef, seconds), ConstantsEnum.timeoutLimit );
  //     await this.indexedDBService.saveUptime(seconds);
  //     // Save the new value to the 'counter' key
  //   } catch (error) {
  //    // console.log("Error saving uptime to Firebase Realtime Database: " + error);
  //   }
  // }

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
 
  // OLD VERSION - WORKS FINE

  // public async resetUptimeCounter(): Promise<void> {
  //   this.resetCounterSubject.next();
  //   await this.saveCounterValue(0);
  // }

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

  // public async getCounterValue(): Promise<number> {
  //   const counterRef = ref(this.db, ConstantsEnum.uptimeObjectStoreName);  // The path to retrieve the counter value
  //   const snapshot = await fetchWithTimeout( get(counterRef), ConstantsEnum.timeoutLimit );
  //   if (snapshot.exists()) {
  //     //console.log("Uptime Exists in firebase");
  //     return snapshot.val(); // Return the counter value
  //   } else {
  //     // console.log('No counter value found. in firebase');

  //     return 0; // Return 0 if no counter value exists
  //   }
  // }

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
