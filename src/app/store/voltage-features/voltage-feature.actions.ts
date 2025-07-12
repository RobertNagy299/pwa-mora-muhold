import { createAction, props } from "@ngrx/store";
import { VoltageInterface } from "../../interfaces/VoltageInterface";

export const fetchHistoricalVoltageData = createAction(
  '[Voltage] Fetch Historical Data'
)

export const setVoltageArray = createAction(
  '[Voltage] Set Voltage Array',
  props<{voltageArray: VoltageInterface[]}>()
)

export const addVoltagePoint = createAction(
  '[Voltage] Add New Voltage Point',
  props<{data: VoltageInterface[]}>()
)

export const startGeneratingVoltageData = createAction(
  '[Voltage] Start Generating Data',

)

export const stopGeneratingVoltageData = createAction(
  '[Voltage] Stop Generating Data'
)


export const startListeningForVoltageDataChanges = createAction(
  '[Voltage] Start Listening For Data Changes'
)

export const stopListeningForVoltageDataChanges = createAction(
  '[Voltage] Stop Listening for Data Changes'
)

export const deleteAllVoltageReadingsFromDB = createAction(
  '[Voltage] Delete All Voltage Readings From DB'
)