import {Component, OnInit} from '@angular/core';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {AuthService} from '../../services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {User} from '../../interfaces/User';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatError,
    NgIf,
    MatButton,
    MatInput,
    MatLabel,
    MatFormField,
    ReactiveFormsModule,
    MatCardContent,
    MatCardTitle,
    MatCard
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userData: User | null = null;
  passwordForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit(): void {
    this.authService.getUserData().subscribe(user => {
      this.userData = user;
    });
  }

  private passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const currentPassword = this.passwordForm.get('currentPassword')?.value;
      const newPassword = this.passwordForm.get('newPassword')?.value;
      if (currentPassword && newPassword) {
        this.authService.changePassword(currentPassword, newPassword).subscribe(() => {
          this.snackBar.open('Password changed successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.passwordForm.reset();



          this.passwordForm.markAsUntouched();
          this.passwordForm.markAsPristine();
          // Reset form control state manually (this will fix the red error borders)
          Object.keys(this.passwordForm.controls).forEach(field => {
            const control = this.passwordForm.get(field);
            if (control) {
              control.setErrors(null); // Remove any errors
              control.markAsUntouched(); // Mark as untouched
              control.markAsPristine();  // Mark as pristine
            }
          });
        }, error => {
          console.log(error.toString());
          if(error.toString().includes("weak-password")){
            console.log("In weak password");
            this.snackBar.open('Failed to change password. New Password must be at least 6 characters long', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          } else if(error.toString().includes("invalid-credential")) {
            console.log("In invalid cred");
            this.snackBar.open('Failed to change password. Current password does not match the one you entered', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
          // this.snackBar.open('Failed to change password.', 'Close', {
          //   duration: 3000,
          //   panelClass: ['error-snackbar']
          // });
        });
      }
    }
  }
}
