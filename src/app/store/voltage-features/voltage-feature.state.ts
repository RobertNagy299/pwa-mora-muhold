import { VoltageInterface } from "../../interfaces/VoltageInterface";

export interface VoltageState {
  dataPoints: VoltageInterface[],
}

export const initialVoltageState: VoltageState = {
  dataPoints: [],
} 