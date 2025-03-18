import { UptimeState } from "./uptime-counter-features/uptimeCounterFeature.state";
import { userAuthState } from "./user-auth-features/userAuthFeature.state";

export interface MyStoreInterface {
    //these key names must match the provideState({name:}) name property
    uptimeState: UptimeState,
    userAuthState: userAuthState,
}