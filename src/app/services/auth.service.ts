

import { Injectable } from '@angular/core';
import {
  Auth,
  deleteUser as authDeleteUser, createUserWithEmailAndPassword,
  EmailAuthProvider,
  User as FirebaseUser,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  user
} from '@angular/fire/auth';
import { deleteDoc, doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { select, Store } from '@ngrx/store';
import { catchError, concat, concatMap, EMPTY, filter, from, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { User } from '../interfaces/User';
import { MyStoreInterface } from '../store/app.store';
import { initializeAuthStateListener } from '../store/user-auth-features/userAuthFeature.actions';
import { selectCurrentLoginStatus, selectCurrentUser, selectCurrentUserAuthState } from '../store/user-auth-features/userAuthFeature.selector';
import { AuthStatesEnum } from '../utils/constants';
import { RoutingRedirectService } from './routing-redirect.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class AuthService {



  public currentUserFromStore$: Observable<User | null>
  public isLoggedInFromStore$: Observable<boolean>
  public authStateFromStore$: Observable<AuthStatesEnum>
  // private currentUserSubject = new BehaviorSubject<User | null>(null);
  // public currentUser$ = this.currentUserSubject.asObservable();

  // private authStateSubject = new BehaviorSubject<AuthStatesEnum>(AuthStatesEnum.UNKNOWN);
  // public authState$ = this.authStateSubject.asObservable();

  // public isLoggedIn$ = this.currentUser$.pipe(
  //   switchMap((value: User | null) => {
  //     if (value !== null) {
  //       return of(true);
  //     }
  //     return of(false);
  //   }),

  //   distinctUntilChanged(),
  // );

  constructor(
    private readonly store: Store<MyStoreInterface>,
    private readonly auth: Auth,
    private readonly firestore: Firestore,
    private readonly routingRedirectService: RoutingRedirectService,
    private readonly router: Router


  ) {

    this.currentUserFromStore$ = this.store.pipe(select(selectCurrentUser), shareReplay(1));
    this.isLoggedInFromStore$ = this.store.pipe(select(selectCurrentLoginStatus), shareReplay(1));
    this.authStateFromStore$ = this.store.pipe(select(selectCurrentUserAuthState), shareReplay(1));
  }



  // NEW
  public init(): void {
    this.store.dispatch(initializeAuthStateListener());
  }


  // MOVED TO EFFECT - WORKS
  public initializeAuthStateListener(): Observable<User | null> {
    return user(this.auth) //Working version used user(this.auth) // Emits when auth state changes
      .pipe(
        switchMap((firebaseUser: FirebaseUser | null) => {
          if (!firebaseUser) {
            return of(null); // If no user, emit null immediately
          }

          const userDocRef = doc(this.firestore, 'users', firebaseUser.uid);
          return from(getDoc(userDocRef)).pipe(
            filter(userDoc => userDoc.exists()),
            map((userDoc) => userDoc.data() as User),
            catchError((err) => {
              console.error("AuthService: Firestore error", err);
              return EMPTY;
            })
          );
        }),
      )

  }


  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    const user = this.auth.currentUser;
    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      return from(reauthenticateWithCredential(user, credential).then(() => {
        return updatePassword(user, newPassword);
      }));
    } else {
      throw new Error('User not authenticated');
    }
  }

  // MOVED TO NGRX STORE EFFECT - WORKS
  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredentials) => {
        const userDocRef = doc(this.firestore, 'users', userCredentials.user.uid);
        return from(getDoc(userDocRef)).pipe(
          filter(userDoc => userDoc.exists()),
          map((userDoc) => userDoc.data() as User),
          catchError((err) => {
            console.error("AuthService: Firestore error", err);
            // ERROR IS HANDED IN THE EFFECT - Show a snackbar
            throw new Error("Failed to log in");
          })
        );
      }),
    );
  }

  // MOVED TO NGRX - WORKS
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  register(username: string, email: string, password: string): Observable<void> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(({ user }) => {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        return from(setDoc(userDocRef, {
          username,
          email,
          role: 'user' // Default role for new users
        }));
      })
    );
  }

  deleteUser(email: string, password: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      console.error(`Error: User is not authenticated, and therefore cannot delete the account.`);
      return EMPTY;
    }

    const credential = EmailAuthProvider.credential(email, password);
    return from(reauthenticateWithCredential(user, credential))
      .pipe(
        concatMap(() => {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return concat(
            deleteDoc(userDocRef),
            authDeleteUser(user),
          );
        }),

        concatMap(() => {
          return this.logout().pipe(
            tap(() => {
              return this.router.navigate([this.routingRedirectService.routeToRedirectToAfterLogOut()]);
            })
          );

        }),

      )
    //Error handling is implemented in the profile component in order to properly display snackbars on the UI
  }
}
