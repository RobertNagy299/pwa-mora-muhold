import { Injectable } from '@angular/core';
import { EventType, Router, RouterEvent } from '@angular/router';
import { filter, Observable, shareReplay } from 'rxjs';
import { pagesThatAGuestShouldNotAccess, pagesThatALoggedInUserShouldNotAccess } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class RoutingRedirectService {

  public redirectAfterLogin$: Observable<RouterEvent> 

  public redirectAfterLogout$: Observable<RouterEvent> 

  private navigationStartEventFilter: Observable<RouterEvent> 

  constructor(
    private router: Router
  ) { 

    this.navigationStartEventFilter = this.router.events.pipe(
      
      filter((e)=> {return e instanceof RouterEvent}),
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
     

    
  }

    

}
