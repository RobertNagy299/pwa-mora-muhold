import { Injectable } from '@angular/core';
import {VoltageInterface} from '../interfaces/VoltageInterface';

@Injectable({
  providedIn: 'root'
})
export class VoltageChartService {

  constructor() { }

  public saveVoltage(voltage: VoltageInterface) {
    //firestore service save
  }
  public getVoltages() {
    //firestore service getall
  }

}
