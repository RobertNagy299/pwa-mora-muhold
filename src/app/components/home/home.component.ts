import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { UptimeService } from '../../services/uptime.service';
import {interval, Subject} from 'rxjs';
import { UptimeTransformPipe } from '../../pipes/uptime-transform.pipe';
import {UntilDestroy} from '@ngneat/until-destroy';
import {ConnectivityService} from '../../services/connectivity.service';

@UntilDestroy()
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [UptimeTransformPipe],
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  uptimeService = inject(UptimeService);
  count = signal(0);
  isOnline: boolean = true;
  private destroy$ = new Subject<void>(); // For cleaning up the subscription


  //global storage ngrx
  constructor(private connectivityService: ConnectivityService) {
    // Increment the counter every second
    this.connectivityService.isOnline$.
    subscribe((status) => {
      this.isOnline = status;
    });
    interval(1000).subscribe(() => {
      this.increment();
    });
  }

  ngOnInit() {
    // Fetch the initial counter value from Firebase when the component is initialized
    this.uptimeService.getCounterValue().then((counter) => {
      this.count.set(counter);
      this.increment();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.uptimeService.saveCounterValue(this.count());
  }

  // Increment the count by 1
  increment() {
    this.count.update(value => value + 1);
    if(this.isOnline) {
      this.uptimeService.saveCounterValue(this.count());
    }
    else {
      this.uptimeService.saveCounterValueToLocalstore(this.count());
    }
  }
}
