import { createReducer, on } from "@ngrx/store";
import { setUserAuthState } from "./userAuthFeature.actions";
import { initialUserAuthState } from "./userAuthFeature.state";

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