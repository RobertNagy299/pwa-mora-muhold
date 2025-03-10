import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { AuthStatesEnum, pagesThatAGuestShouldNotAccess, pagesThatALoggedInUserShouldNotAccess } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.authState$.pipe(
      tap(userAuthState => console.log("AuthGuard: Received user state:", userAuthState)),

      filter((userAuthState) => userAuthState !== AuthStatesEnum.UNKNOWN),
      take(1), // Take the first value
      switchMap(userAuthState => {

        console.log(`in AuthGuard, route.url[0].path = ${route.url[0].path}`);

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
              
              this.router.navigate(['/login', {redirect: '/profile'}]);
              return of(false);
              
            }
            return of(true);
          }
        }

      })
    );
  }
}
