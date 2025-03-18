import {createReducer, on} from "@ngrx/store";
import { incrementUptime, resetUptime, setUptime } from "./uptimeCounterFeature.actions";
import {initialUptimeState} from './uptimeCounterFeature.state';

export const uptimeReducer = createReducer(
    initialUptimeState,
    on(setUptime, (state, {newValue}) => {
        return ({
            ...state,
            uptime: newValue,
        });
    }),
    on(incrementUptime, (state) => (
        {
            ...state,
            uptime: state.uptime + 1
        }
    )),
    on(resetUptime, (state) => ({
        ...state,
        uptime: 0
    }))
);