import { ChangeDetectionStrategy, Component, inject, Injectable, OnInit, signal } from '@angular/core';
import { UptimeService } from '../../services/uptime.service';
import { catchError, combineLatest, concatMap, filter, interval, map, Observable, of, race, Subscription, switchMap, tap } from 'rxjs';
import { UptimeTransformPipe } from '../../pipes/uptime-transform.pipe';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IndexedDBService } from '../../services/indexed-db.service';
import { ConstantsEnum } from '../../utils/constants';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { GradientTextDirective } from '../../directives/gradient-text.directive';
import { fetchWithTimeout } from '../../utils/fetchWithTimeout';

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

  // OLD BUT GOLD

  // startIncrementing() {
  //   this.intervalSubscription = interval(1000).subscribe(() => {
  //     this.increment();
  //   });
  // }


  startIncrementing() {
    this.intervalSubscription = interval(1000)
    .pipe(
      tap(() => {
        this.count.update(value => value + 1);
      }),
      concatMap(() =>{
        return this.saveCounterValue();
      })

    ).subscribe()
  }


  // OLD BUT SILVER

  // async ngOnInit() {
  //   // First, try to fetch the counter value from IndexedDB (this might be wrong, we should fetch from fireBase first)
  //   try {
  //     const storedCounter = await this.indexedDBService.getUptime();

  //     if (storedCounter !== null) {
  //       this.count.set(storedCounter);  // Use stored value from IndexedDB

  //     } else {
  //       // If IndexedDB doesn't have a value, fetch from Firebase
  //       const counter = await this.uptimeService.getCounterValue();
  //       this.count.set(counter);
  //       // Save the counter value to IndexedDB on successful fetch
  //       await this.indexedDBService.saveUptime(counter);

  //     }
  //     this.startIncrementing();
  //   } catch (err) {
  //     console.error('Failed to fetch from Firebase or IndexedDB', err);
  //     // Start incrementing even if the fetch fails
  //     this.startIncrementing();
  //   }
  // }

  ngOnInit(): void {

    // THIS PART WAS DONE WITHOUT MY MENTOR'S SUPERVISION
    // ASK HIM ABOUT THIS TOMORROW (02.18.2025) MM/DD/YYYY

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

  // OLD BUT GOLD 

  // async saveCounterValue() {
  //   const currentValue = this.count();
  //   await this.indexedDBService.saveUptime(currentValue);

  //   try {
  //     await this.saveToFirebaseWithTimeout(currentValue, ConstantsEnum.timeoutLimit); 
  //   } catch (err) {
  //    // console.error('Failed to save to Firebase, but saved to IndexedDB', err);
  //   }
  // }

  saveCounterValue(): Observable<boolean> {
    return this.indexedDBService.saveUptime(this.count())
      .pipe(
        switchMap(() => {
          return fetchWithTimeout(this.uptimeService.saveCounterValue(this.count()), ConstantsEnum.timeoutLimit)
        }),

      )
  }

  // // Method to save to Firebase with a timeout

  /**
   * MIGHT BE REDUNDANT, OLD BUT BRONZE
   */
  // saveToFirebaseWithTimeout(value: number, timeout: number): Observable<void> {
  //   const firebasePromise = this.uptimeService.saveCounterValue(value);
  //   const timeoutPromise = new Promise<void>((_, reject) =>
  //     setTimeout(() => reject(new Error('Firebase save timed out')), timeout)
  //   );
  //   return race([firebasePromise, timeoutPromise]);
  // }


  /**
   * OLD BUT GOLD
   */

  // Increment the count by 1
  // increment() {
  //   this.count.update(value => value + 1);
  //   if (!this.updating) {
  //     this.updating = true;

  //     this.saveCounterValue().finally(() => {


  //       this.updating = false;
  //     });
  //   }
  // }

  //Increment the count by 1
  increment() {
    this.count.update(value => value + 1);
    if (!this.updating) {
      this.updating = true;

      this.saveCounterValue().subscribe(() => {
        this.updating = false;
      });
    }
  }
}
