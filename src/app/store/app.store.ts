import { UptimeState } from "./uptimeCounterFeature/uptimeCounterFeature.state";
import { userAuthState } from "./userAuthFeatures/userAuthFeature.state";

export interface MyStoreInterface {
    //these key names must match the provideState({name:}) name property
    uptimeState: UptimeState,
    userAuthState: userAuthState,
}