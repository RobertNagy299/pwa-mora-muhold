

import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, getFirestore, deleteDoc } from '@angular/fire/firestore';
import {
  Auth, getAuth, signInWithEmailAndPassword,
  signOut, createUserWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser as authDeleteUser,
  UserCredential, user, User as FirebaseUser,
  onAuthStateChanged
} from '@angular/fire/auth';
import { BehaviorSubject, catchError, concat, concatMap, EMPTY, filter, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { User } from '../interfaces/User';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthStatesEnum } from '../utils/constants';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private authStateSubject = new BehaviorSubject<AuthStatesEnum>(AuthStatesEnum.unknown);
  public authState$ = this.authStateSubject.asObservable();

  public isLoggedIn$ = this.currentUser$.pipe(
    switchMap((value: User | null) => {
      if(value !== null) {
        return of(true);
      }
      return of(false);
    })
  );

  constructor(private readonly firestore: Firestore, private readonly auth: Auth, private router: Router) {
    this.auth = getAuth();
    this.firestore = getFirestore();
    this.initializeAuthStateListener();
  }

  getUserData(): Observable<User | null> {
    return this.currentUser$;
  }

  


  //MOST RECENT VERSION - WORKS FINE
  private initializeAuthStateListener(): void {
    console.log("AuthService: Initializing auth state listener...");

    user(this.auth) // Emits when auth state changes
      .pipe(
        tap((firebaseUser) => 
          {
            console.log("AuthService: Firebase auth state changed:", firebaseUser);   
            if (firebaseUser) {
              this.authStateSubject.next(AuthStatesEnum.authenticated);
            }
            else {
              this.authStateSubject.next(AuthStatesEnum.unauthenticated);
            }

          }), // Emit auth state

        switchMap((firebaseUser: FirebaseUser | null) => {
          if (!firebaseUser) {
            console.log("AuthService: No user, emitting null");
            this.authStateSubject.next(AuthStatesEnum.unauthenticated);
            return of(null); // If no user, emit null immediately
          }

          const userDocRef = doc(this.firestore, 'users', firebaseUser.uid);
          return from(getDoc(userDocRef)).pipe(
            tap((userDoc) => console.log("AuthService: User document fetched:", userDoc.exists() ? userDoc.data() : "not found")),
            filter(userDoc => userDoc.exists()),
            map((userDoc) => userDoc.data() as User),
            catchError((err) => {
              console.error("AuthService: Firestore error", err);
              this.authStateSubject.next(AuthStatesEnum.unauthenticated);
              return EMPTY;
            }) 
          );
        }),

        switchMap((userData: User | null) => {

          console.log("AuthService: Final userData emission:", userData);
          if(userData === null) {
            this.authStateSubject.next(AuthStatesEnum.unauthenticated);
          }
          else{
            this.authStateSubject.next(AuthStatesEnum.authenticated);
          }         
          this.currentUserSubject.next(userData)

          return EMPTY;
        })
      ).subscribe()
    
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

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.authStateSubject.next(AuthStatesEnum.unauthenticated)
      })
    );
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
          return this.logout()
            .pipe(

              tap(() => {
                return this.router.navigate(['/home']);
              }),

              untilDestroyed(this)

            )
        }),

      )
      //Error handling is implemented in the profile component in order to properly display snackbars on the UI
  }

}
