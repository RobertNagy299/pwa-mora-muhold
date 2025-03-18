import {props, createAction} from "@ngrx/store"

export const setUptime = createAction(
    '[Uptime] Set Uptime',
    props<{newValue: number}>()
);


export const resetUptime = createAction(
    '[Uptime] Reset Uptime'
)

export const incrementUptime = createAction(
    '[Uptime] Increment Uptime',
)

export const loadUptime = createAction(
    '[Uptime] Load Uptime',
)

export const saveUptime = createAction(
    '[Uptime] Save Uptime',
)

export const startIncrementing = createAction(
    '[Uptime] Start Incrementing'
)