

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../interfaces/User';
import { UntilDestroy } from '@ngneat/until-destroy';
import { select, Store } from '@ngrx/store';
import { MyStoreInterface } from '../store/app.store';
import { initializeAuthStateListener } from '../store/userAuthFeatures/userAuthFeature.actions';
import { selectCurrentLoginStatus, selectCurrentUser, selectCurrentUserAuthState, selectUserAuthObj } from '../store/userAuthFeatures/userAuthFeature.selector';
import { AuthStatesEnum } from '../utils/constants';

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
    private readonly store: Store<MyStoreInterface>
  ) {

    this.currentUserFromStore$ = this.store.pipe(select(selectCurrentUser));
    this.isLoggedInFromStore$ = this.store.pipe(select(selectCurrentLoginStatus));
    this.authStateFromStore$ = this.store.pipe(select(selectCurrentUserAuthState));

    // this.currentUserFromStore$.subscribe((data) => {
    //   console.log("New current User From Store inside authService: ", JSON.stringify(data))
    // })
    // this.initializeAuthStateListener().subscribe();
  }



  // NEW
  public init(): void {
    this.store.dispatch(initializeAuthStateListener());
    // this.store.pipe(select(selectUserAuthObj)).subscribe((data) => {
    //   console.log('Auth State object inside  authService. init()', JSON.stringify(data))
    // })

  }


  // MOVED TO EFFECT - UNTESTED
  // private initializeAuthStateListener(): Observable<void> {
  //   console.log("AuthService: Initializing auth state listener...");

  //   return user(this.auth) //Working version used user(this.auth) // Emits when auth state changes
  //     .pipe(
  //       tap((firebaseUser) => {
  //         console.log("AuthService: Firebase auth state changed:", firebaseUser);

  //       }), // Emit auth state

  //       switchMap((firebaseUser: FirebaseUser | null) => {
  //         if (!firebaseUser) {
  //           console.log("AuthService: No user, emitting null");
  //           return of(null); // If no user, emit null immediately
  //         }

  //         const userDocRef = doc(this.firestore, 'users', firebaseUser.uid);
  //         return from(getDoc(userDocRef)).pipe(
  //           tap((userDoc) => console.log("AuthService: User document fetched:", userDoc.exists() ? userDoc.data() : "not found")),
  //           filter(userDoc => userDoc.exists()),
  //           map((userDoc) => userDoc.data() as User),
  //           catchError((err) => {
  //             console.error("AuthService: Firestore error", err);
  //             this.authStateSubject.next(AuthStatesEnum.UNAUTHENTICATED);
  //             return EMPTY;
  //           })
  //         );
  //       }),

  //       switchMap((userData: User | null) => {

  //         console.log("AuthService: Final userData emission:", userData);

  //         this.currentUserSubject.next(userData);

  //         if (userData === null) {
  //           this.authStateSubject.next(AuthStatesEnum.UNAUTHENTICATED);
  //         }
  //         else {
  //           this.authStateSubject.next(AuthStatesEnum.AUTHENTICATED);
  //         }


  //         return EMPTY;
  //       })
  //     )

  // }


  // CHANGED TO NGRX - UNTESTED

  // changePassword(currentPassword: string, newPassword: string): Observable<void> {
  //   const user = this.auth.currentUser;
  //   if (user && user.email) {
  //     const credential = EmailAuthProvider.credential(user.email, currentPassword);
  //     return from(reauthenticateWithCredential(user, credential).then(() => {
  //       return updatePassword(user, newPassword);
  //     }));
  //   } else {
  //     throw new Error('User not authenticated');
  //   }
  // }

  // MOVED TO NGRX STORE EFFECT - UNTESTED

  // login(email : string, password: string): Observable<User> {
  //   return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
  //     switchMap((userCredentials) => {
  //       const userDocRef = doc(this.firestore, 'users', userCredentials.user.uid);
  //       return from(getDoc(userDocRef)).pipe(
  //         tap((userDoc) => console.log("AuthService: User document fetched:", userDoc.exists() ? userDoc.data() : "not found")),
  //         filter(userDoc => userDoc.exists()),
  //         map((userDoc) => userDoc.data() as User),
  //         catchError((err) => {
  //           console.error("AuthService: Firestore error", err);
  //           this.authStateSubject.next(AuthStatesEnum.UNAUTHENTICATED);
  //           return EMPTY;
  //         })
  //       );
  //     }),

  //     tap((userData: User) => {
  //       this.currentUserSubject.next(userData);
  //       this.authStateSubject.next(AuthStatesEnum.AUTHENTICATED);

  //     })
  //   );
  // }



  // MOVED TO NGRX - UNTESTED
  // logout(): Observable<void> {
  //   return from(signOut(this.auth)).pipe(
  //     tap(() => {
  //       this.authStateSubject.next(AuthStatesEnum.UNAUTHENTICATED)
  //     })
  //   );
  // }

  // MOVED TO NGRX - UNTESTED
  // register(username: string, email: string, password: string): Observable<void> {
  //   return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
  //     switchMap(({ user }) => {
  //       const userDocRef = doc(this.firestore, `users/${user.uid}`);
  //       return from(setDoc(userDocRef, {
  //         username,
  //         email,
  //         role: 'user' // Default role for new users
  //       }));
  //     })
  //   );
  // }



  // MOVED TO NGRX - UNTESTED

  //   deleteUser(email: string, password: string): Observable<void> {
  //     const user = this.auth.currentUser;
  //     if (!user) {
  //       console.error(`Error: User is not authenticated, and therefore cannot delete the account.`);
  //       return EMPTY;
  //     }

  //     const credential = EmailAuthProvider.credential(email, password);
  //     return from(reauthenticateWithCredential(user, credential))
  //       .pipe(
  //         concatMap(() => {
  //           const userDocRef = doc(this.firestore, `users/${user.uid}`);
  //           return concat(
  //             deleteDoc(userDocRef),
  //             authDeleteUser(user),
  //           );
  //         }),

  //         concatMap(() => {
  //           return this.logout()
  //             .pipe(

  //               tap(() => {
  //                 return this.router.navigate(['/home']);
  //               }),



  //             )
  //         }),

  //       )
  //     //Error handling is implemented in the profile component in order to properly display snackbars on the UI
  //   }

}
