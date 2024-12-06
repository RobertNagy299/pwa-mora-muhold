import { Injectable } from '@angular/core';
import {Firestore, doc, getDoc, setDoc, getFirestore} from '@angular/fire/firestore';
import {
  Auth, getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  signOut, createUserWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider
} from '@angular/fire/auth';
import { BehaviorSubject, from, Observable, switchMap } from 'rxjs';
import { User } from '../interfaces/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private roleSubject = new BehaviorSubject<string | null>(null);
  public role$ = this.roleSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$ = this.authStateSubject.asObservable();

  constructor(private firestore: Firestore, private auth: Auth) {
    this.auth = getAuth();
    this.firestore = getFirestore();
    this.initializeAuthStateListener();
  }

  getUserData(): Observable<User | null> {
    return this.currentUser$;
  }

  private initializeAuthStateListener(): void {
    onAuthStateChanged(this.auth, async (user) => {
      this.authStateSubject.next(!!user); // Emit whether the user is logged in or not
      if (user) {
        try {
          const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.currentUserSubject.next(userData as User); // Emit user data if logged in
          } else {
            this.currentUserSubject.next(null); // If no user data found
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          this.currentUserSubject.next(null); // On error, emit null
        }
      } else {
        this.currentUserSubject.next(null); // If no user is logged in, emit null
      }
    });
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


  login(email: string, password: string): Observable<any> {
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
}
