import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TemperatureState } from "./temperature-feature.state";

export const selectTemperatureState = createFeatureSelector<TemperatureState>('temperature');

export const selectTemperatureArray = createSelector(
  selectTemperatureState,
  (state) => state.dataPoints
)