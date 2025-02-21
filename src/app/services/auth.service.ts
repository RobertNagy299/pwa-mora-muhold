// OLD VERSION WORKS, BUT DOES NOT DELETE USER FROM FIRE AUTHENTICATION
// import { Injectable } from '@angular/core';
// import {Firestore, doc, getDoc, setDoc, getFirestore, deleteDoc} from '@angular/fire/firestore';
// import {
//   Auth, getAuth, onAuthStateChanged, signInWithEmailAndPassword,
//   signOut, createUserWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider
// } from '@angular/fire/auth';
// import { BehaviorSubject, from, Observable, switchMap } from 'rxjs';
// import { User } from '../interfaces/User';
// import {Router} from '@angular/router';
// import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
//
// @UntilDestroy()
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//
//
//   private currentUserSubject = new BehaviorSubject<User | null>(null);
//   public currentUser$ = this.currentUserSubject.asObservable();
//
//   private authStateSubject = new BehaviorSubject<boolean>(false);
//   public authState$ = this.authStateSubject.asObservable();
//
//   constructor(private firestore: Firestore, private auth: Auth, private router: Router) {
//     this.auth = getAuth();
//     this.firestore = getFirestore();
//     this.initializeAuthStateListener();
//   }
//
//   getUserData(): Observable<User | null> {
//     return this.currentUser$;
//   }
//
//   private initializeAuthStateListener(): void {
//     onAuthStateChanged(this.auth, async (user) => {
//       this.authStateSubject.next(!!user); // Emit whether the user is logged in or not
//       if (user) {
//         try {
//           const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
//           if (userDoc.exists()) {
//             const userData = userDoc.data();
//             this.currentUserSubject.next(userData as User); // Emit user data if logged in
//           } else {
//             this.currentUserSubject.next(null); // If no user data found
//           }
//         } catch (error) {
//           console.error('Error fetching user data:', error);
//           this.currentUserSubject.next(null); // On error, emit null
//         }
//       } else {
//         this.currentUserSubject.next(null); // If no user is logged in, emit null
//       }
//     });
//   }
//
//   changePassword(currentPassword: string, newPassword: string): Observable<void> {
//     const user = this.auth.currentUser;
//     if (user && user.email) {
//       const credential = EmailAuthProvider.credential(user.email, currentPassword);
//       return from(reauthenticateWithCredential(user, credential).then(() => {
//         return updatePassword(user, newPassword);
//       }));
//     } else {
//       throw new Error('User not authenticated');
//     }
//   }
//
//
//   login(email: string, password: string): Observable<any> {
//     return from(signInWithEmailAndPassword(this.auth, email, password));
//   }
//
//   logout(): Observable<void> {
//     return from(signOut(this.auth));
//   }
//
//   register(username: string, email: string, password: string): Observable<void> {
//     return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
//       switchMap(({ user }) => {
//         const userDocRef = doc(this.firestore, `users/${user.uid}`);
//         return from(setDoc(userDocRef, {
//           username,
//           email,
//           role: 'user' // Default role for new users
//         }));
//       })
//     );
//   }
//
//   deleteUser(email: string, password: string): Observable<void> {
//     const user = this.auth.currentUser;
//     if (user) {
//       const credential = EmailAuthProvider.credential(email, password);
//       return from(
//         reauthenticateWithCredential(user, credential).then(async () => {
//           const userDocRef = doc(this.firestore, `users/${user.uid}`);
//           await deleteDoc(userDocRef);
//           this.logout().pipe(untilDestroyed(this)).subscribe(() => {
//             this.router.navigate(['/home']);
//           });
//         })
//       );
//     } else {
//       throw new Error('User not authenticated');
//     }
//   }
// }

import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, getFirestore, deleteDoc } from '@angular/fire/firestore';
import {
  Auth, getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  signOut, createUserWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser as authDeleteUser,
  UserCredential, user, User as FirebaseUser
} from '@angular/fire/auth';
import { BehaviorSubject, catchError, concat, concatMap, EMPTY, filter, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { User } from '../interfaces/User';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$ = this.authStateSubject.asObservable();

  public isLoggedIn$ = this.authState$.pipe(
    untilDestroyed(this),
    map((value) => value)
  );

  constructor(private readonly firestore: Firestore, private readonly auth: Auth, private router: Router) {
    this.auth = getAuth();
    this.firestore = getFirestore();
    this.initializeAuthStateListener();
  }

  getUserData(): Observable<User | null> {
    return this.currentUser$;
  }

  // OLD BUT GOLD

  // private initializeAuthStateListener(): void {
  //   onAuthStateChanged(this.auth, async (user) => {
  //     this.authStateSubject.next(!!user); // Emit whether the user is logged in or not
  //     if (user) {
  //       try {
  //         const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
  //         if (userDoc.exists()) {
  //           const userData = userDoc.data();
  //           this.currentUserSubject.next(userData as User); // Emit user data if logged in
  //         } else {
  //           this.currentUserSubject.next(null); // If no user data found
  //         }
  //       } catch (error) {
  //        // console.error('Error fetching user data:', error);
  //         this.currentUserSubject.next(null); // On error, emit null
  //       }
  //     } else {
  //       this.currentUserSubject.next(null); // If no user is logged in, emit null
  //     }
  //   });
  // }

  private initializeAuthStateListener(): void {
    user(this.auth) // Emits when auth state changes
      .pipe(
        tap((firebaseUser) => this.authStateSubject.next(!!firebaseUser)), // Emit auth state

        switchMap((firebaseUser: FirebaseUser | null) => {
          if (!firebaseUser) {
            return of(null); // If no user, emit null immediately
          }

          const userDocRef = doc(this.firestore, 'users', firebaseUser.uid);
          return from(getDoc(userDocRef)).pipe(
            filter(userDoc => userDoc.exists()),
            map((userDoc) => userDoc.data() as User),
            catchError(() => EMPTY) // Catch Firestore errors and emit null
          );
        })
      )
      .subscribe((userData: User | null) => this.currentUserSubject.next(userData));
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

  // OLD BUT GOLD

  // deleteUser(email: string, password: string): Observable<void> {
  //   const user = this.auth.currentUser;
  //   if (user) {
  //     const credential = EmailAuthProvider.credential(email, password);
  //     return from(
  //       reauthenticateWithCredential(user, credential).then(async () => {
  //         const userDocRef = doc(this.firestore, `users/${user.uid}`);
  //         await deleteDoc(userDocRef);
  //         return authDeleteUser(user); // Delete the user from Firebase Authentication
  //       }).then(() => {
  //         this.logout()
  //         .pipe(untilDestroyed(this))
  //         .subscribe(async () => {
  //           await this.router.navigate(['/home']);
  //         });
  //       })
  //     );
  //   } else {
  //     throw new Error('User not authenticated');f
  //   }
  // }

  deleteUser(email: string, password: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      console.error(`Error: User is not authenticated, and therefore cannot delete the account.`);
      return of();
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

        catchError((err) => {
          console.log(`Error deleting user: ${err.message}`);
          return of();
        })

      )
  }

}
