import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Your AuthService
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, finalize, from, map, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';

@UntilDestroy()
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  successMessage: string | null = null;
  errorMessageExists$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  errorMessage: string | null = null;
  submitted: boolean = false;
  private authSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    // makeshift solution to patch the faulty guards
    this.authSubscription = this.authService.getUserData()
      .subscribe(
        async user => {
          if (user !== null && user !== undefined) {
            await this.router.navigate(['/home']);
          }
        }
      );
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password)
        .pipe(

          tap(() => {
            this.successMessage = 'Login successful';
            // this.errorMessage = null;
            this.snackBar.open(this.successMessage, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          }),



          catchError((error) => {
            this.errorMessage = 'Login failed: ' + error.message;
            this.errorMessageExists$.next(true);
            this.successMessage = null;
            return of(null);
          }),
          // if false, stream stops (doesn't complete)
          filter((value) => {
            return value !== null
          }),

          switchMap(() => { return from(this.router.navigate(['/home'])); }),
          untilDestroyed(this),
          // finalize(() => this.router.navigate(['/home'])),

        )
        .subscribe()

    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}

