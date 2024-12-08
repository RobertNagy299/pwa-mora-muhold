import {Component, inject, Injectable, OnDestroy, OnInit, signal} from '@angular/core';
import { UptimeService } from '../../services/uptime.service';
import {interval, Subscription} from 'rxjs';
import { UptimeTransformPipe } from '../../pipes/uptime-transform.pipe';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ConnectivityService} from '../../services/connectivity.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [UptimeTransformPipe],
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  uptimeService = inject(UptimeService);
  public count = signal(0);
  isOnline: boolean = true;
  private updating = false;
  // Global subscriptions, they are unsubscribed from in the root component, don't worry
  public intervalSubscription: Subscription | null = null;
  public resetTimerSubscription: Subscription | null = null;

  //global storage ngrx state management (tfw no [count, setCount] = React.useState(0); )
  constructor(private connectivityService: ConnectivityService) {

    console.log("Home constructor runs!");
    this.connectivityService.isOnline$.pipe(untilDestroyed(this)).
    subscribe((status) => {
      this.isOnline = status;
    });

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
    console.log("Home ngOnInit runs!");
    // Fetch the initial counter value from Firebase when the component is initialized
    this.uptimeService.getCounterValue().then((counter) => {
      this.count.set(counter);
      this.startIncrementing();

    });
  }

   ngOnDestroy() {
    console.log("Home ngOnDestroy runs!");
    // this.saveCounterValue();
  }

  //save counter value
  async saveCounterValue() {
    if (this.isOnline) {
      await this.uptimeService.saveCounterValue(this.count());
    } else {
      this.uptimeService.saveCounterValueToLocalstore(this.count());
    }
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
