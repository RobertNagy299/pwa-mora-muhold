import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map, of, tap } from "rxjs";
import { User } from "../../interfaces/User";
import { AuthService } from "../../services/auth.service";
import { RoutingRedirectService } from "../../services/routing-redirect.service";
import { AuthStatesEnum } from "../../utils/constants";
import { initializeAuthStateListener, login, logout, setUserAuthState } from "./userAuthFeature.actions";


@Injectable()
export class UserAuthEffects {

  constructor (
    private readonly actions$: Actions,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
    private readonly routingRedirectService: RoutingRedirectService,
    private readonly authService: AuthService,
  ) { }

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(logout),
    exhaustMap(() => {
      return this.authService.logout();
    }),
    map(() => {
      this.snackBar.open('Logged out successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      this.router.navigate([this.routingRedirectService.routeToRedirectToAfterLogOut()]);
      return setUserAuthState(
        {
          _currentAuthState: AuthStatesEnum.UNAUTHENTICATED,
          _currentUser: null,
          _isLoggedIn: false,
        });
    }),
  ));

  login$ = createEffect(() => this.actions$.pipe(
    ofType(login),
    exhaustMap((action) => {
      return this.authService.login(action.email, action.password).pipe(
        tap(() => {
          return this.router.navigate([this.routingRedirectService.routeToRedirectToAfterLogin()]);
        }),
        map((user: User) => {
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          return setUserAuthState({
            _currentUser: user,
            _currentAuthState: AuthStatesEnum.AUTHENTICATED,
            _isLoggedIn: true,
          });
        }),
        catchError((err) => {
          console.error("[Auth API] - login: Firestore error", err);
          this.snackBar.open('Login failed!', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          // this might be redundant, maybe return empty is enough
          return of(setUserAuthState({
            _currentUser: null,
            _currentAuthState: AuthStatesEnum.UNAUTHENTICATED,
            _isLoggedIn: false,
          }));
        }),
      );
    }),
    // CATCHERROR HERE IS BAD, IT ENSURES THAT THE EFFECT ONLY RUNS UNTIL THE FIRST ERROR, THEN NOTHING EVER HAPPENS
  ));

  // OK
  initializeAuthStateListener$ = createEffect(() => this.actions$.pipe(
    ofType(initializeAuthStateListener),
    exhaustMap(() => {
      return this.authService.initializeAuthStateListener();
    }),
    map((user: User | null) => {
      if (user === null) {
        return setUserAuthState({
          _currentAuthState: AuthStatesEnum.UNAUTHENTICATED,
          _isLoggedIn: false,
          _currentUser: null,
        });
      }
      return setUserAuthState({
        _currentAuthState: AuthStatesEnum.AUTHENTICATED,
        _isLoggedIn: true,
        _currentUser: user,
      });
    })
  ),
  );
}
