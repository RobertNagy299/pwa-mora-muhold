import { DataPointModel } from "../services/chart-service";

export interface VoltageInterface extends DataPointModel {
  voltage: number,
  uptime: number,
}
