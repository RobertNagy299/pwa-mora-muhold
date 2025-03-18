import { User } from "../../interfaces/User";
import { AuthStatesEnum } from "../../utils/constants";

export interface userAuthState {
  currentUser: User | null;
  isLoggedIn: boolean;
  currentAuthState: AuthStatesEnum;  
}

export const initialUserAuthState: userAuthState = {
  
  currentUser: null,
  isLoggedIn: false,
  currentAuthState: AuthStatesEnum.UNKNOWN,
}