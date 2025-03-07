import { Auth } from "@angular/fire/auth";
import { createAction, props } from "@ngrx/store";

export const login = createAction(
    '[Auth API] Login',
    props<{email: string, password: string}>()
)

export const logout = createAction(
    '[Auth API] Log Out',
    props<{userAuth: Auth}>()
)