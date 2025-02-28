import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Your AuthService
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, from,Observable,of, Subscription, switchMap, tap } from 'rxjs';
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  successMessage : WritableSignal<string> = signal("");
  errorMessageExists$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  errorMessage: WritableSignal<string> = signal("");
  submitted: boolean = false;
  nextPageToRedirecTo: WritableSignal<string> = signal('');
  
  // private authSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    console.log(`In login, this.route.snapshot.paramMap.get('redirect') = ${this.route.snapshot.paramMap.get('redirect')}`);
    this.nextPageToRedirecTo.set(this.route.snapshot.paramMap.get('redirect') ?? '/home');
  }
 

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password)
        .pipe(

          tap(() => {
            this.successMessage.set('Login successful');
            // this.errorMessage = null;
            this.snackBar.open(this.successMessage(), 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          }),



          catchError((error) => {
            this.errorMessage.set('Login failed: ' + error.message);
            this.errorMessageExists$.next(true);
            this.successMessage.set("");
            return of(null);
          }),
          // if false, stream stops (doesn't complete)
          filter((value) => {
            return value !== null
          }),

          switchMap(() => { 
            console.log(`in Login Form final redirect, nextPage = ${this.nextPageToRedirecTo()}`)
            return from(this.router.navigate([this.nextPageToRedirecTo()])); 
          }),
          untilDestroyed(this),
          // finalize(() => this.router.navigate(['/home'])),

        )
        .subscribe()

    }
  }


}

