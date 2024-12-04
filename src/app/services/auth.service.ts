import { Injectable } from '@angular/core';
import {Firestore, doc, setDoc, getFirestore, getDoc} from '@angular/fire/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  Auth,
  signInWithEmailAndPassword
} from '@angular/fire/auth';
import {BehaviorSubject, from, Observable, switchMap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private roleSubject = new BehaviorSubject<string | null>(null);
  public role$ = this.roleSubject.asObservable();

  constructor(private firestore: Firestore, private auth: Auth) {
    this.auth = getAuth();
    this.firestore = getFirestore();
    this.initializeAuthStateListener();
  }

  private initializeAuthStateListener(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.roleSubject.next(userData ? userData['role'] : null);
          } else {
            this.roleSubject.next(null);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          this.roleSubject.next(null);
        }
      } else {
        this.roleSubject.next(null);
      }
    });
  }

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(username: string, email: string, password: string) {
    // Create user with email and password
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      // After creating the user, save additional user information in Firestore
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
