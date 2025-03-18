import { User } from "./User";

export interface ProfilePageData {
  hasInternetAccess: boolean,
  user: User | null
}