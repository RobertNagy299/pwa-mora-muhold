import {Injectable} from '@angular/core';
import {BehaviorSubject, fromEvent, Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {

  private onlineStatusSubject: BehaviorSubject<boolean>;


  constructor() {
    // Initialize the BehaviorSubject with the current online status
    this.onlineStatusSubject = new BehaviorSubject<boolean>(navigator.onLine);

    // Listen for online and offline events to update the status
    fromEvent(window, 'online').subscribe(() => {
      this.onlineStatusSubject.next(true); // Set online when the 'online' event is fired
    });

    fromEvent(window, 'offline').subscribe(() => {
      this.onlineStatusSubject.next(false); // Set offline when the 'offline' event is fired
    });
  }

  // Observable to subscribe to for online/offline status
  get isOnline$(): Observable<boolean> {
    return this.onlineStatusSubject.asObservable();
  }

}
