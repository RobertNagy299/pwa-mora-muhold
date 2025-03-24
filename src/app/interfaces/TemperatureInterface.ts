import { DataPointModel } from "../services/chart-service";

export interface TemperatureInterface extends DataPointModel { 
    temperature: number,
    uptime: number

}