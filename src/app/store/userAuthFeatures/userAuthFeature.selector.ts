import { createFeatureSelector, createSelector } from "@ngrx/store";
import { userAuthState } from "./userAuthFeature.state";

export const selectUserAuthState = createFeatureSelector<userAuthState>('userAuth');


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