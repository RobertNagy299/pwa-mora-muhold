import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../interfaces/User';
import { TemperatureFirebaseService } from '../../services/temperature-firebase.service';
import { VoltageFirebaseService } from '../../services/voltage-firebase.service';
import { UptimeService } from '../../services/uptime.service';
import { MatDivider } from '@angular/material/divider';
import { HomeComponent } from '../home/home.component';
import { catchError, debounceTime, EMPTY, map, merge, Observable, of, Subscription, tap, throttleTime } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Router } from '@angular/router';
import { ConnectivityService } from '../../services/connectivity.service';
import { HomeService } from '../../services/home-service.service';
import { Store } from '@ngrx/store';
import { MyStoreInterface } from '../../store/app.store';
import { resetUptime, setUptime } from '../../store/uptimeCounterFeature/uptimeCounterFeature.actions';

@UntilDestroy()
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
    MatCard,
    MatDivider,
    MatIcon,
    AsyncPipe
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  userData: User | null = null;
  passwordForm!: FormGroup;
  deleteForm!: FormGroup;
  
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private voltageService: VoltageFirebaseService,
    private temperatureService: TemperatureFirebaseService,
    private uptimeService: UptimeService,
    private router: Router,
    protected connectivityService: ConnectivityService,
    
    private store: Store<MyStoreInterface>,
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
    this.deleteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.getUserData()
    .pipe(
      map(user => {
        console.log(`User inside Profile page = ${user}`);
        this.userData = user;
      }),

      untilDestroyed(this))
    .subscribe();
  }

  private passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }




  // NEW VERSION
  // Confirmed to be acceptable
  resetData() : Observable<void> {
    if (confirm('Are you sure you want to reset the data?'))  {
        
       this.store.dispatch(resetUptime())
        

        merge(
          this.voltageService.deleteAllVoltageReadings(),
          this.temperatureService.deleteAllTemperatureReadings(),
          
          // old solution, works!

          // this.uptimeService.resetUptimeCounter().pipe(
          //   tap(() => {
          //     this.homeService.setCounterValue(0);
          //   })
          // ),
        ).pipe(
          tap(() => {
             
            this.snackBar.open('Data reset successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });

          }),

          map((/*success*/) => {
            return this.router.navigate(['/home']);
          }),

          catchError((error) => {
            console.error('Failed to reset data', error.message);
            this.snackBar.open('Failed to reset data.', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });

            return of(null)
          }),

         

        ).subscribe()

       



      
    }
    return of();
  }




  changePassword(): void {
    
    if(!this.passwordForm.valid) {
      return;
    }

    const currentPassword = this.passwordForm.get('currentPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    if (!currentPassword || !newPassword ) {
      return ;
    }

    this.authService.changePassword(currentPassword, newPassword)
    .pipe(

      debounceTime(1200),
     
  
      tap(() => {
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
        }
      ),

      catchError((error) => {
        // console.log(error.toString());
        if (error.toString().includes("weak-password")) {
          // console.log("In weak password");
          this.snackBar.open('Failed to change password. New Password must be at least 6 characters long', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        } else if (error.toString().includes("invalid-credential")) {
          //  console.log("In invalid cred");
          this.snackBar.open('Failed to change password. Current password does not match the one you entered', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
        return EMPTY;
      })


    ).subscribe()
    


  }


  deleteUser(): void {
    if(!this.deleteForm.valid) {
      return;
    }

    const email = this.deleteForm.get('email')?.value;
    const password = this.deleteForm.get('password')?.value;


    if (!(email && password)) {
      return;
    }

    this.authService.deleteUser(email, password)
    .pipe(
     
      debounceTime(1200),

      tap(() => {
          this.snackBar.open('User deleted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        
        }
      ),

      catchError(error => {

        if (error.toString().includes("wrong-password")) {
          // console.log("Wrong password");
          this.snackBar.open('Failed to delete user. The password you entered is incorrect', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            }  
          );   
        } 
          
        else {
          this.snackBar.open('Failed to delete user.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }

        return EMPTY;
      }),


    ).subscribe()

  }


}
