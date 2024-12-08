import {inject, Injectable} from '@angular/core';

import { Database, ref, set, get } from '@angular/fire/database';
import {Subject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
//  Uptime is a Singleton document
export class UptimeService {

  private db: Database = inject(Database);
  private resetCounterSubject = new Subject<void>();


  constructor() {}

  public saveCounterValueToLocalstore(seconds: number) : void {
    localStorage.setItem('uptime', seconds.toString());
  }
  // Save the counter value in Realtime Database
  public async saveCounterValue(seconds: number): Promise<void> {
    const counterRef = ref(this.db, 'counter');  // The path to store the counter value
    try {
      await set(counterRef, seconds);  // Save the new value to the 'counter' key
    } catch (error) {
      console.log("Error saving uptime to Firebase Realtime Database: " + error);
    }
  }

  // Reset counter
  public resetUptimeCounter(): void {
    this.resetCounterSubject.next();
    this.saveCounterValue(0);
  }

  // Get the reset counter observable
  get resetCounter$() {
    return this.resetCounterSubject.asObservable();
  }



  // Get the counter value from Realtime Database
  public async getCounterValue(): Promise<number> {
    const counterRef = ref(this.db, 'counter');  // The path to retrieve the counter value
    const snapshot = await get(counterRef);
    if (snapshot.exists()) {
      return snapshot.val(); // Return the counter value
    } else {
      // console.log('No counter value found.');
      const localdata = localStorage.getItem('uptime');
      if (localdata !== null && localdata !== undefined) {
        return parseInt(localdata);
      }
      console.log("Counter doesn't exist!");

      return 0; // Return 0 if no counter value exists
    }
  }
}
