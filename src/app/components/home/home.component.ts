import {ChangeDetectionStrategy, Component, inject, Injectable, OnInit, signal} from '@angular/core';
import {UptimeService} from '../../services/uptime.service';
import {interval, Subscription} from 'rxjs';
import {UptimeTransformPipe} from '../../pipes/uptime-transform.pipe';
import {UntilDestroy} from '@ngneat/until-destroy';
import {IndexedDBService} from '../../services/indexed-db.service';
import {ConstantsEnum} from '../../utils/constants';
import {AuthService} from '../../services/auth.service';
import {AsyncPipe, NgIf} from '@angular/common';
import {GradientTextDirective} from '../../directives/gradient-text.directive';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [UptimeTransformPipe, AsyncPipe, NgIf, GradientTextDirective],
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  uptimeService = inject(UptimeService);
  indexedDBService = inject(IndexedDBService);
  public count = signal(0);

  private updating = false;
  // Global subscriptions, they are unsubscribed from in the root component, don't worry
  public intervalSubscription: Subscription | null = null;
  public resetTimerSubscription: Subscription | null = null;


  constructor(protected authService: AuthService) {
    // Subscribe to the reset counter event from the UptimeService
    this.resetTimerSubscription = this.uptimeService.resetCounter$
      .subscribe(() => {
        this.count.set(0);
      });
  }

  startIncrementing() {
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.increment();
    });
  }

  async ngOnInit() {
    // First, try to fetch the counter value from IndexedDB
    try {
      const storedCounter = await this.indexedDBService.getUptime();
      if (storedCounter !== null) {
        this.count.set(storedCounter);  // Use stored value from IndexedDB

      } else {
        // If IndexedDB doesn't have a value, fetch from Firebase
        const counter = await this.uptimeService.getCounterValue();
        this.count.set(counter);
        // Save the counter value to IndexedDB on successful fetch
        await this.indexedDBService.saveUptime(counter);

      }
      this.startIncrementing();
    } catch (err) {
      console.error('Failed to fetch from Firebase or IndexedDB', err);
      // Start incrementing even if the fetch fails
      this.startIncrementing();
    }
  }

  async saveCounterValue() {
    const currentValue = this.count();
    await this.indexedDBService.saveUptime(currentValue);

    try {
      await this.saveToFirebaseWithTimeout(currentValue, ConstantsEnum.timeoutLimit); // 3 seconds timeout
    } catch (err) {
     // console.error('Failed to save to Firebase, but saved to IndexedDB', err);
    }
  }
  // Method to save to Firebase with a timeout
  saveToFirebaseWithTimeout(value: number, timeout: number): Promise<void> {
    const firebasePromise = this.uptimeService.saveCounterValue(value);
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase save timed out')), timeout)
    );
    return Promise.race([firebasePromise, timeoutPromise]);
  }
  // Increment the count by 1
  increment() {
    this.count.update(value => value + 1);
    if (!this.updating) {
      this.updating = true;

      this.saveCounterValue().finally(() => {


        this.updating = false;
      });
    }
  }
}
