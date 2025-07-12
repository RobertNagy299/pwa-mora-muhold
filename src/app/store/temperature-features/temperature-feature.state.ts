import { TemperatureInterface } from "../../interfaces/TemperatureInterface";

export interface TemperatureState {
  dataPoints: TemperatureInterface[],
}

export const initialTemperatureState: TemperatureState = {
  dataPoints: [],
} 