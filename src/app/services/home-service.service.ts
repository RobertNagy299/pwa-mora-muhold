import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MyStoreInterface } from '../store/app.store';
import { loadUptime, startIncrementing } from '../store/uptime-counter-features/uptimeCounterFeature.actions';
import { selectUptime } from '../store/uptime-counter-features/uptimeCounterFeature.selectors';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  // private count = signal(0);
  public uptimeValue$?: Observable<number>;


  constructor(
    // private indexedDBService: IndexedDBService,
    // private uptimeService: UptimeService,
    private store: Store<MyStoreInterface>
  ) {
    // console.log("Created a homeService instance!");



  }


  public init(): void {
    this.store.dispatch(loadUptime());
    this.store.dispatch(startIncrementing());
    this.uptimeValue$ = this.store.pipe(select(selectUptime));
  }





}
