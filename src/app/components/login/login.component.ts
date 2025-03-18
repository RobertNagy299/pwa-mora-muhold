import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { MyStoreInterface } from '../../store/app.store';
import { login } from '../../store/user-auth-features/userAuthFeature.actions';

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
export class LoginComponent  {
  
  protected loginForm: FormGroup;
  ////successMessage : WritableSignal<string> = signal("");
 // errorMessageExists$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
 // errorMessage: WritableSignal<string> = signal("");
 // submitted: boolean = false;
 // nextPageToRedirecTo: WritableSignal<string> = signal('');
  


  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store<MyStoreInterface>,

  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  // ngOnInit(): void {
  //   console.log(`In login, this.route.snapshot.paramMap.get('redirect') = ${this.route.snapshot.paramMap.get('redirect')}`);
  //   this.nextPageToRedirecTo.set(this.route.snapshot.paramMap.get('redirect') ?? '/home');
  // }
 

  onSubmit() {
    //this.submitted = true;

    
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log("VALID LOGIN FORM");
      this.store.dispatch(login({email, password}));
      
    //  this.authService.login(email, password)
     //   .pipe(

          // MOVED TO EFFECT
          // tap(() => {
          //   this.successMessage.set('Login successful');
          //   // this.errorMessage = null;
          //   this.snackBar.open(this.successMessage(), 'Close', {
          //     duration: 3000,
          //     panelClass: ['success-snackbar']
          //   });
          // }),


          // MIGRATED TO NGRX

          // catchError((error) => {
          //   this.errorMessage.set('Login failed: ' + error.message);
          //   this.errorMessageExists$.next(true);
          //   this.successMessage.set("");
          //   return of(null);
          // }),
          // if false, stream stops (doesn't complete)
          // filter((value) => {
          //   return value !== null
          // }),
          
          
          // switchMap(() => { 
          //   console.log(`in Login Form final redirect, nextPage = ${this.nextPageToRedirecTo()}`)
          //   return from(this.router.navigate([this.nextPageToRedirecTo()])); 
          // }),
         

       // )
      //  .subscribe()

    }
  }


}

