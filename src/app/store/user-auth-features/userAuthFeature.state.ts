import { User } from "../../interfaces/User";
import { AuthStatesEnum } from "../../utils/constants";

export interface UserAuthState {
  currentUser: User | null;
  isLoggedIn: boolean;
  currentAuthState: AuthStatesEnum;  
}

export const initialUserAuthState: UserAuthState = {
  
  currentUser: null,
  isLoggedIn: false,
  currentAuthState: AuthStatesEnum.UNKNOWN,
}