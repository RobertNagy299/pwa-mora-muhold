import {inject, Injectable} from '@angular/core';

import { Database, ref, set, get } from '@angular/fire/database';
import {Subject} from 'rxjs';
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
  public async saveCounterValue(seconds: number): Promise<void> {
    const counterRef = ref(this.db, ConstantsEnum.uptimeObjectStoreName);  // The path to store the counter value
    try {
      await fetchWithTimeout( set(counterRef, seconds), ConstantsEnum.timeoutLimit );
      await this.indexedDBService.saveUptime(seconds);
      // Save the new value to the 'counter' key
    } catch (error) {
     // console.log("Error saving uptime to Firebase Realtime Database: " + error);
    }
  }

  // Reset counter
  public async resetUptimeCounter(): Promise<void> {
    this.resetCounterSubject.next();
    await this.saveCounterValue(0);
  }

  // Get the reset counter observable
  get resetCounter$() {
    return this.resetCounterSubject.asObservable();
  }



  // Get the counter value from Realtime Database
  public async getCounterValue(): Promise<number> {
    const counterRef = ref(this.db, ConstantsEnum.uptimeObjectStoreName);  // The path to retrieve the counter value
    const snapshot = await fetchWithTimeout( get(counterRef), ConstantsEnum.timeoutLimit );
    if (snapshot.exists()) {
      //console.log("Uptime Exists in firebase");
      return snapshot.val(); // Return the counter value
    } else {
      // console.log('No counter value found. in firebase');

      return 0; // Return 0 if no counter value exists
    }
  }
}
