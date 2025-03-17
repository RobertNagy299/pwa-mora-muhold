import { createReducer, on } from "@ngrx/store";
import { initialUserAuthState } from "./userAuthFeature.state";
import { setUserAuthState } from "./userAuthFeature.actions";

export const userAuthReducer = createReducer(
  initialUserAuthState,
  on(setUserAuthState, (state, { _currentUser, _isLoggedIn, _currentAuthState }) => {
    return ({
      ...state,

      currentUser: _currentUser,
      isLoggedIn: _isLoggedIn,
      currentAuthState: _currentAuthState

    })
  })
)