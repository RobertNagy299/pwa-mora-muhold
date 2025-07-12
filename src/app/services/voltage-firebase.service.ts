import { Injectable } from '@angular/core';
import { ChartTypeEnum } from '../utils/constants';
import { ChartService } from './chart-service';


@Injectable({
  providedIn: 'root'
})
export class VoltageFirebaseService extends ChartService {

  constructor() {
    super(ChartTypeEnum.VOLTAGE);
  }
}
