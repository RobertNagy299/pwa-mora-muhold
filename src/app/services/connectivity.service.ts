
import { Injectable } from '@angular/core';
import { distinctUntilChanged, fromEvent, map, merge, shareReplay, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {

  public readonly isOnline$ = merge(
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false)),
  ).pipe(
    startWith(navigator.onLine ?? true),
    //tap(x => console.log('asd', x)),
    distinctUntilChanged(),
    shareReplay(1)
  )
}
