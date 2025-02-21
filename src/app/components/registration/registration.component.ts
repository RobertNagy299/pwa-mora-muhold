import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import {shareReplay, Subscription} from 'rxjs';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {MatSnackBar} from '@angular/material/snack-bar';

@UntilDestroy()
@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationComponent implements OnInit, OnDestroy {
  protected registerForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  submitted: boolean = false;
  private authSubscription: Subscription | null = null;


  constructor( private snackBar: MatSnackBar,
               private router: Router,
               private fb: FormBuilder,
               private authService: AuthService) {

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validator: this.mustMatch('password', 'confirmPassword') });

    this.registerForm.markAsUntouched();
    this.registerForm.markAsPristine();

  }
  ngOnInit() {
    this.authSubscription = this.authService.getUserData().subscribe(async user => {
      if (user !== null && user !== undefined) {
        await this.router.navigate(['/home']);
      }
    });
  }
  onSubmit() {


    this.submitted = true; // Mark the form as submitted
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;
      const registered$ = this.authService.register(username, email, password).pipe(
        shareReplay(1)
      );
      
      this.authService.register(username, email, password).pipe(untilDestroyed(this)).subscribe(
        () => {

          this.successMessage = 'User registered successfully';
          this.errorMessage = null;
          this.registerForm.reset();
          this.snackBar.open(this.successMessage, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          this.registerForm.markAsUntouched();
          this.registerForm.markAsPristine();
          // Reset form control state manually (this will fix the red error borders)
          Object.keys(this.registerForm.controls).forEach(field => {
            const control = this.registerForm.get(field);
            if (control) {
              control.setErrors(null); // Remove any errors
              control.markAsUntouched(); // Mark as untouched
              control.markAsPristine();  // Mark as pristine
            }
          });

          this.submitted = true; // Reset the submitted flag after successful registration

        },
        (error) => {
          this.errorMessage = 'Error registering user: ' + error.message;
          this.successMessage = null;
        }
      );
    }
  }

  private mustMatch(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[password];
      const matchingControl = formGroup.controls[confirmPassword];
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  ngOnDestroy() {
    if(this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
