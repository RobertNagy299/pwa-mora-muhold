import { Injectable, signal } from '@angular/core';
import { concatMap, filter, interval, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { ConstantsEnum } from '../utils/constants';
import { IndexedDBService } from './indexed-db.service';
import { UptimeService } from './uptime.service';
import { select, Store } from '@ngrx/store';
import { MyStoreInterface } from '../store/app.store';
import { loadUptime, startIncrementing } from '../store/uptimeCounterFeature/uptimeCounterFeature.actions';
import { selectUptime } from '../store/uptimeCounterFeature/uptimeCounterFeature.selectors';

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
