import { Auth } from "@angular/fire/auth";
import { createAction, props } from "@ngrx/store";
import { userAuthState } from "./userAuthFeature.state";
import { User } from "../../interfaces/User";
import { AuthStatesEnum } from "../../utils/constants";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormGroup } from "@angular/forms";

export const login = createAction(
    '[Auth API] Login',
    props<{email: string, password: string}>()
)

export const logout = createAction(
    '[Auth API] Log Out',
    // props<{snackBar: MatSnackBar}>()
)

export const register = createAction(
    '[Auth API] Registration',
    props<{registerForm: FormGroup<any>}>()
)

export const changePassword = createAction(
    '[Auth API] Change Password',
    props<{passwordForm: FormGroup<any>}>()
)

export const deleteAccount = createAction(
    '[Auth API] Delete Account',
    props<{deleteForm: FormGroup<any>}>()
)

export const initializeAuthStateListener = createAction(
    '[Auth API] Initialize Auth State Listener'
)

export const setUserAuthState = createAction(
    '[Auth API] Set UserAuthState',
    props<{ _currentUser: User | null;
      _isLoggedIn: boolean;
      _currentAuthState: AuthStatesEnum;   }>()
)
