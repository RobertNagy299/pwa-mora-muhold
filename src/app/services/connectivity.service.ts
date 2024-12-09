import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {
  private onlineStatusSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public onlineStatus$: Observable<boolean> = this.onlineStatusSubject.asObservable();

  constructor() {
    this.checkOnlineStatus();
  }

  private checkOnlineStatus(): void {
    interval(5000).pipe( // Check every 5 seconds
      switchMap(() => this.fetchResource())
    ).pipe(untilDestroyed(this)).subscribe(
      (isOnline) => this.onlineStatusSubject.next(isOnline),
      (error) => this.onlineStatusSubject.next(false)
    );
  }

  private fetchResource(): Observable<boolean> {
    return new Observable((observer) => {
      fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' })
        .then(() => {
          observer.next(true);
          observer.complete();
        })
        .catch(() => {
          observer.next(false);
          observer.complete();
        });
    });
  }
}
