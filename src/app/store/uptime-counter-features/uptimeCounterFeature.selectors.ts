import { createSelector, createFeatureSelector } from "@ngrx/store";
import { UptimeState } from "./uptimeCounterFeature.state";

export const selectUptimeState = createFeatureSelector<UptimeState>('uptime');

export const selectUptime = createSelector(
    selectUptimeState,
    (state) => state.uptime,
)















//mentor's stuff

/*
{
    uptimeState: {
        uptime: 0
    }
}
disp: startIncrement ->
5s
disp: loadUptime ->

disp: setUptime ->

{
    uptimeState: {
        uptime: x
    }
}

disp: startIncrement ->
{
    uptimeState: {
        uptime: x+1
    }
}

{
    uptimeState: {
        uptime: x+1
    }
}

{
    uptimeState: {
        uptime: x+1
    }
}

*/