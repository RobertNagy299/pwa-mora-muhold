import { createFeatureSelector, createSelector } from "@ngrx/store";
import { VoltageState } from "./voltage-feature.state";

export const selectVoltageState = createFeatureSelector<VoltageState>('voltage');

export const selectVoltageArray = createSelector(
  selectVoltageState,
  (state) => state.dataPoints
)