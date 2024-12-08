import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Your AuthService
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

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
})
export class LoginComponent implements OnInit, OnDestroy  {
  loginForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  submitted: boolean = false;
  private authSubscription: Subscription | null = null;

  constructor(private router: Router ,private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.authSubscription = this.authService.getUserData().subscribe(user => {
      if(user !== null && user !== undefined) {
        this.router.navigate(['/home']).catch(err => {
          console.log(err);
        });
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).pipe(untilDestroyed(this)).subscribe(
        () => {
          this.successMessage = 'Login successful';
          this.errorMessage = null;
          setTimeout(()=>{
            this.router.navigate(['/home']);
          }, 350);
        },
        (error) => {
          this.errorMessage = 'Login failed: ' + error.message;
          this.successMessage = null;
        }
      );
    }
  }

  ngOnDestroy() {
    if(this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}

