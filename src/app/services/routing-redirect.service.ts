import { Injectable, signal, WritableSignal } from '@angular/core';
import { ActivatedRouteSnapshot, EventType, Router, RouterEvent } from '@angular/router';
import { filter, Observable, shareReplay } from 'rxjs';
import { pagesThatAGuestShouldNotAccess, pagesThatALoggedInUserShouldNotAccess } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class RoutingRedirectService {

  private redirectAfterLogin$: Observable<RouterEvent>

  private redirectAfterLogout$: Observable<RouterEvent>

  private navigationStartEventFilter: Observable<RouterEvent>

  public routeToRedirectToAfterLogin: WritableSignal<string> = signal('/home');

  public routeToRedirectToAfterLogOut: WritableSignal<string> = signal('/home');

  constructor(
    private router: Router
  ) {

    this.navigationStartEventFilter = this.router.events.pipe(

      filter((e) => { return e instanceof RouterEvent }),
      filter((e) => e.type === EventType.NavigationStart),
      shareReplay(1),
    )

    this.redirectAfterLogin$ = this.navigationStartEventFilter
      .pipe(
        filter((e) => !pagesThatALoggedInUserShouldNotAccess.has(e.url)),
      )

    this.redirectAfterLogout$ = this.navigationStartEventFilter
      .pipe(
        filter((e) => !pagesThatAGuestShouldNotAccess.has(e.url)),

      )


    this.redirectAfterLogin$
      .subscribe((e: RouterEvent) => {
      //  console.log(`navigated in main: RouterEvent.url = ${e.url.split('redirect')}`);

        this.routeToRedirectToAfterLogin.set(e.url);
      })


    this.redirectAfterLogout$
      .subscribe((e: RouterEvent) => {
        this.routeToRedirectToAfterLogOut.set(e.url)
      })


  }



}
