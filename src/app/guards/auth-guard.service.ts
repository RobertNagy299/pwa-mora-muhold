import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { RoutingRedirectService } from '../services/routing-redirect.service';
import { AuthStatesEnum, pagesThatAGuestShouldNotAccess, pagesThatALoggedInUserShouldNotAccess } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly routingRedirectService: RoutingRedirectService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.authStateFromStore$.pipe(
      filter((userAuthState) => userAuthState !== AuthStatesEnum.UNKNOWN),
      take(1), // Take the first value
      switchMap(userAuthState => {
        switch (userAuthState) {
          case AuthStatesEnum.AUTHENTICATED: {
            if (pagesThatALoggedInUserShouldNotAccess.has(`/${route.url[0].path}`)) {
              this.router.navigate(['/home']);
              return of(false);
            }
            return of(true);
          }
          case AuthStatesEnum.UNAUTHENTICATED: {
            if (pagesThatAGuestShouldNotAccess.has(`/${route.url[0].path}`)) {
              this.router.navigate(['/login', { redirect: '/profile' }]);
              this.routingRedirectService.routeToRedirectToAfterLogin.set('/profile')
              return of(false);
            }
            return of(true);
          }
        }
      })
    );
  }
}
