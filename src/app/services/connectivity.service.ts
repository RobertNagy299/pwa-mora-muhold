import {Injectable, OnDestroy} from '@angular/core';
import {fromEvent, merge, Observable, of} from 'rxjs';
import { UntilDestroy } from '@ngneat/until-destroy';
import {map} from 'rxjs/operators';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class ConnectivityService implements OnDestroy {

  isOnline$: Observable<boolean>;
  // EGY ISTENNEK SE AKAR MUKODNI EZ A KIBASZOTT KURVA SZAR HOGY A JO BUDOS KURVA ANYJA BASZNA MEG AZ EGESZ ANGULAROS KIBASZOTT SZART GECIWEIC24HI2T424H2T4H24C24C
  constructor() {
    this.isOnline$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(()=>true)),
      fromEvent(window, 'offline').pipe(map(()=>false))
    );
  }
  ngOnDestroy() {
    console.log("Connection service destroyed!");
  }
}
