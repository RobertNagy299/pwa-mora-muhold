import { createFeatureSelector, createSelector } from "@ngrx/store";
import { UserAuthState } from "./userAuthFeature.state";

export const selectUserAuthState = createFeatureSelector<UserAuthState>('userAuth');


export const selectUserAuthObj = createSelector(
  selectUserAuthState,
  (state) => state,
)

export const selectCurrentUserAuthState = createSelector(
  selectUserAuthState,
  (state) => state.currentAuthState,

)

export const selectCurrentLoginStatus = createSelector(
  selectUserAuthState,
  (state) => state.isLoggedIn,
)

export const selectCurrentUser = createSelector(
  selectUserAuthState,
  (state) => state.currentUser,
)