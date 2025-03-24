import { createReducer, on } from "@ngrx/store";
import { initialVoltageState } from "./voltage-feature.state";
import { addVoltagePoint, deleteAllVoltageReadingsFromDB, setVoltageArray } from "./voltage-feature.actions";

export const voltageReducer = createReducer(
  initialVoltageState,
  on(setVoltageArray, (state, { voltageArray }) => {
    return ({
      ...state,
      dataPoints: voltageArray,
    })
  }
  ),
  on(deleteAllVoltageReadingsFromDB, (state) => {
    return ({
      ...state,
      dataPoints: []
    })
  }),
  on(addVoltagePoint, (state, { data }) => {
    return ({
      ...state,
      dataPoints: [...state.dataPoints.slice(-29), ...data]
    })
  })
)