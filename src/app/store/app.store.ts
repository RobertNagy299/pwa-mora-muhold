import { UptimeState } from "./uptime-counter-features/uptimeCounterFeature.state";
import { UserAuthState } from "./user-auth-features/userAuthFeature.state";
import { VoltageState } from "./voltage-features/voltage-feature.state";

export interface MyStoreInterface {
    //these key names must match the provideState({name:}) name property
    uptimeState: UptimeState,
    userAuthState: UserAuthState,
    voltageState: VoltageState,
    
}