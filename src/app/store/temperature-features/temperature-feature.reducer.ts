import { createReducer, on } from "@ngrx/store";
import { initialTemperatureState } from "./temperature-feature.state";
import { addTemperaturePoint, deleteAllTemperatureReadingsFromDB, setTemperatureArray } from "./temperature-feature.actions";

export const temperatureReducer = createReducer(
  initialTemperatureState,
  on(setTemperatureArray, (state, { temperatureArray }) => {
    return ({
      ...state,
      dataPoints: temperatureArray,
    })
  }
  ),
  on(deleteAllTemperatureReadingsFromDB, (state) => {
    return ({
      ...state,
      dataPoints: []
    })
  }),
  on(addTemperaturePoint, (state, { data }) => {
    return ({
      ...state,
      dataPoints: [...state.dataPoints.slice(-29), ...data]
    })
  })
)