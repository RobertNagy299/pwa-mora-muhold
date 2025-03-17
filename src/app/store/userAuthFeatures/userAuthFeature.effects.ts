import { Injectable } from "@angular/core";

import { deleteDoc, doc, Firestore, getDoc, getFirestore, setDoc } from "@angular/fire/firestore";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { changePassword, deleteAccount, initializeAuthStateListener, login, logout, register, setUserAuthState } from "./userAuthFeature.actions";
import { filter, from, of, switchMap, tap, map, EMPTY, catchError, exhaustMap, concatMap, concat, debounceTime } from "rxjs";
import {
  Auth, getAuth, signInWithEmailAndPassword,
  signOut, createUserWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser as authDeleteUser,
  user, User as FirebaseUser
} from '@angular/fire/auth';
import { AuthStatesEnum } from "../../utils/constants";
import { User } from "../../interfaces/User";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { RoutingRedirectService } from "../../services/routing-redirect.service";


@Injectable()
export class UserAuthEffects {

  constructor(
    private readonly actions$: Actions,
    private readonly firestore: Firestore,
    private readonly auth: Auth,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
    private readonly routingRedirectService: RoutingRedirectService,


  ) {
    this.auth = getAuth();
    this.firestore = getFirestore();
  }

  deleteAccount$ = createEffect(() => this.actions$.pipe(
    ofType(deleteAccount),
    debounceTime(1200),




    exhaustMap((action) => {

      if (!action.deleteForm.valid) {
        return EMPTY;
      }

      const email = action.deleteForm.get('email')?.value;
      const password = action.deleteForm.get('password')?.value;


      if (!(email && password)) {
        return EMPTY;
      }
      const user = this.auth.currentUser;
      if (!user) {
        console.error(`Error: User is not authenticated, and therefore cannot delete the account.`);
        return of(-1);
      }

      const credential = EmailAuthProvider.credential(email, password);
      return from(reauthenticateWithCredential(user, credential)).pipe(
        concatMap(() => {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return concat(
            deleteDoc(userDocRef),
            authDeleteUser(user),
          ).pipe(
            tap(() => {
              this.snackBar.open('User deleted successfully!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            })
          );
        }),
      )
    }),

    filter((val) => val !== -1),

    map(() => {
      return logout();
    }),

    catchError(error => {

      if (error.toString().includes("wrong-password")) {
        // console.log("Wrong password");
        this.snackBar.open('Failed to delete user. The password you entered is incorrect', 'Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        }
        );
      }

      else {
        console.error("Failed to delete user, the error is: ", error);
        this.snackBar.open('Failed to delete user.', 'Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      }

      return EMPTY;
    }),

  ));

  register$ = createEffect(() => this.actions$.pipe(
    ofType(register),
    exhaustMap((action) => {

      if (!action.registerForm.valid) {
        return EMPTY;
      }

      const { username, email, password } = action.registerForm.value;


      return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
        switchMap(({ user }) => {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return from(setDoc(userDocRef, {
            username,
            email,
            role: 'user' // Default role for new users
          }));
        }),

        tap(() => {
          this.snackBar.open('Registration successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          action.registerForm.reset();
          action.registerForm.markAsUntouched();
          action.registerForm.markAsPristine();
          // Reset form control state manually (this will fix the red error borders)
          Object.keys(action.registerForm.controls).forEach(field => {
            const control = action.registerForm.get(field);
            if (control) {
              control.setErrors(null); // Remove any errors
              control.markAsUntouched(); // Mark as untouched
              control.markAsPristine();  // Mark as pristine
            }
          });
        }),

        catchError((error) => {
          console.error("Error registering user: ", error);
          this.snackBar.open('Registration failed!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          return EMPTY;
        }),

      );
    })
  ), { dispatch: false });

  changePassword$ = createEffect(() => this.actions$.pipe(
    ofType(changePassword),
    debounceTime(1200),
    exhaustMap((action) => {

      if (!action.passwordForm.valid) {
        return EMPTY;
      }

      const currentPassword = action.passwordForm.get('currentPassword')?.value;
      const newPassword = action.passwordForm.get('newPassword')?.value;

      if (!currentPassword || !newPassword) {
        return EMPTY;
      }
      const user = this.auth.currentUser;

      if (!user || !user.email) {
        throw new Error('User not authenticated');

      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      return from(reauthenticateWithCredential(user, credential)).pipe(
        exhaustMap(() => {
          return updatePassword(user, newPassword);
        }),
        tap(() => {

          this.snackBar.open('Password changed successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          action.passwordForm.reset();



          action.passwordForm.markAsUntouched();
          action.passwordForm.markAsPristine();
          // Reset form control state manually (this will fix the red error borders)
          Object.keys(action.passwordForm.controls).forEach(field => {
            const control = action.passwordForm.get(field);
            if (control) {
              control.setErrors(null); // Remove any errors
              control.markAsUntouched(); // Mark as untouched
              control.markAsPristine();  // Mark as pristine
            }
          });

        }),
      )

    }),


    catchError((error) => {
      // console.log(error.toString());
      if (error.toString().includes("weak-password")) {
        // console.log("In weak password");
        this.snackBar.open('Failed to change password. New Password must be at least 6 characters long', 'Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      } else if (error.toString().includes("invalid-credential")) {
        //  console.log("In invalid cred");
        this.snackBar.open('Failed to change password. Current password does not match the one you entered', 'Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      } else {
        this.snackBar.open('Failed to change password. User is not authenticated!', 'Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      }
      return EMPTY;
    })
  ), { dispatch: false });

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(logout),
    exhaustMap(() => {
      return from(signOut(this.auth));

    }),

    map(() => {

      this.snackBar.open('Logged out successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      this.router.navigate([this.routingRedirectService.routeToRedirectToAfterLogOut()])

      return setUserAuthState(
        {
          _currentAuthState: AuthStatesEnum.UNAUTHENTICATED,
          _currentUser: null,
          _isLoggedIn: false,
        });
    }),



  ))

  login$ = createEffect(() => this.actions$.pipe(
    ofType(login),
    exhaustMap((action) => {
      return from(signInWithEmailAndPassword(this.auth, action.email, action.password)).pipe(
        switchMap((userCredentials) => {
          const userDocRef = doc(this.firestore, 'users', userCredentials.user.uid);
          return from(getDoc(userDocRef)).pipe(
            tap((userDoc) => console.log("AuthService: User document fetched:", userDoc.exists() ? userDoc.data() : "not found")),
            filter(userDoc => userDoc.exists()),

            map((userDoc) => {

              this.snackBar.open('Login successful!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });



              return userDoc.data() as User
            }),

            catchError((err) => {
              console.error("[Auth API] - login: Firestore error", err);
              this.snackBar.open('Login failed!', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar'],
              })
              //  this.authStateSubject.next(AuthStatesEnum.UNAUTHENTICATED);

              // this might be redundant, maybe return empty is enough
              return setUserAuthState({
                _currentUser: null,
                _currentAuthState: AuthStatesEnum.UNAUTHENTICATED,
                _isLoggedIn: false,
              }) && EMPTY;
            })
          );
        }),

      );
    }),



    map((user: User) => {

      this.router.navigate([this.routingRedirectService.routeToRedirectToAfterLogin()])

      return setUserAuthState({
        _currentUser: user,
        _currentAuthState: AuthStatesEnum.AUTHENTICATED,
        _isLoggedIn: true,
      })
    })
  ));

  initializeAuthStateListener$ = createEffect(() => this.actions$.pipe(
    ofType(initializeAuthStateListener.type),
    exhaustMap(() => {
      console.log("Initializing auth state listner from effect...")
      return user(this.auth).pipe(

        switchMap((firebaseUser: FirebaseUser | null) => {
          if (!firebaseUser) {
            return of(null)
          }
          const userDocRef = doc(this.firestore, 'users', firebaseUser.uid);
          return from(getDoc(userDocRef)).pipe(
            // tap((userDoc) => console.log("AuthService: User document fetched:", userDoc.exists() ? userDoc.data() : "not found")),
            filter(userDoc => userDoc.exists()),
            map((userDoc) => {
              console.log("User found in auth state listener: ", userDoc.data())
              return userDoc.data() as User
            }),
            catchError((err) => {
              console.error("AuthService: Firestore error", err);
              // this.authStateSubject.next(AuthStatesEnum.UNAUTHENTICATED);
              return of(null);
            })
          );

        }),

        map((user: User | null) => {

          if (user === null) {
            return setUserAuthState({
              _currentAuthState: AuthStatesEnum.UNAUTHENTICATED,
              _isLoggedIn: false,
              _currentUser: null,
            })
          }
          return setUserAuthState({
            _currentAuthState: AuthStatesEnum.AUTHENTICATED,
            _isLoggedIn: true,
            _currentUser: user,
          })
        })
      )
    }),


  )
  );


}