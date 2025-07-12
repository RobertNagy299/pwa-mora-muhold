import { createAction, props } from "@ngrx/store";
import { TemperatureInterface } from "../../interfaces/TemperatureInterface";

export const fetchHistoricalTemperatureData = createAction(
  '[Temperature] Fetch Historical Data'
)

export const setTemperatureArray = createAction(
  '[Temperature] Set Temperature Array',
  props<{temperatureArray: TemperatureInterface[]}>()
)

export const addTemperaturePoint = createAction(
  '[Temperature] Add New Temperature Point',
  props<{data: TemperatureInterface[]}>()
)

export const startGeneratingTemperatureData = createAction(
  '[Temperature] Start Generating Data',

)

export const stopGeneratingTemperatureData = createAction(
  '[Temperature] Stop Generating Data'
)


export const startListeningForTemperatureDataChanges = createAction(
  '[Temperature] Start Listening For Data Changes'
)

export const stopListeningForTemperatureDataChanges = createAction(
  '[Temperature] Stop Listening for Data Changes'
)

export const deleteAllTemperatureReadingsFromDB = createAction(
  '[Temperature] Delete All Temperature Readings From DB'
)