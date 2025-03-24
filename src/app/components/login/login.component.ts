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

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store<MyStoreInterface>,

  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }



  onSubmit() {

    
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log("VALID LOGIN FORM");
      this.store.dispatch(login({email, password}));
    

    }
  }


}

