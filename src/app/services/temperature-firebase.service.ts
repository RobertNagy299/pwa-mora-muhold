import { Injectable } from '@angular/core';
import { ChartTypeEnum } from '../utils/constants';
import { ChartService } from './chart-service';

@Injectable({
  providedIn: 'root'
})
export class TemperatureFirebaseService extends ChartService {

  constructor() {
    super(ChartTypeEnum.TEMPERATURE);
  }
  // TODO firebase init hosting, dist/mora-muhold, firebase deploy --only hosting
}
