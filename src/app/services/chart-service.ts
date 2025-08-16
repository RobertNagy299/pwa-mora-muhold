import { Chart } from "chart.js";
import { ChartTypeEnum, Constants } from "../utils/constants";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

import { inject } from "@angular/core";
import { Database, get, limitToLast, orderByKey, query, ref, remove, set } from '@angular/fire/database';
import { catchError, concatMap, debounceTime, from, interval, map, merge, Observable, of } from 'rxjs';
import { ConnectivityService } from "./connectivity.service";
import { IndexedDBService } from './indexed-db.service';
import { UptimeService } from "./uptime.service";

export interface DataPointModel {
  uptime: number,
  [sensorMeasurement: string]: any,
}

const coefficientMap: Map<string, number> = new Map<string, number>(
  [
    ["voltage", 5],
    ["temperature", 40],
  ]
);

export abstract class ChartService {

  private readonly indexedDBService = inject(IndexedDBService);
  private readonly db = inject(Database);
  private readonly uptimeService = inject(UptimeService);
  private readonly connectivityService = inject(ConnectivityService);

  private readonly dbStoreName: string;
  private readonly timeoutLimit: number;


  readonly chartType: ChartTypeEnum;

  constructor (type: ChartTypeEnum) {
    this.chartType = type;
    this.dbStoreName = `${this.chartType}ObjectStoreName`;
    this.timeoutLimit = Constants.get("timeoutLimit");
  }

  updateChart<TType extends DataPointModel>(chart: Chart, data: TType[]): void {
    if (data === undefined || data.length < 1) {
      return;
    }
    const keys = Object.keys(data[0]);
    if (keys.length !== 2) {
      console.error(`Chart data point object must have exactly two (2) keys! Currently, it has ${keys.length}: ${keys}`);
      return;
    }

    if (chart && data.length > 0) {
      data.forEach((reading: TType) => {
        const uptime = reading.uptime;
        const sensorInfo = reading[this.chartType];

        // Update chart with new data
        if (chart !== null && chart.data.labels !== undefined) {
          chart.data.labels.push(uptime);
          chart.data.datasets[0].data.push(sensorInfo);
          if (chart.data.datasets[0].data.length > 30) {
            chart.data.datasets[0].data.shift();
          }
          if (chart.data.labels.length > 30) {
            chart.data.labels.shift();
          }
          chart.update();
        }
      });
    }
  }

  fetchHistoricalData(limit: number): Observable<DataPointModel[]> {
    return fetchWithTimeout(
      from(get(query(ref(this.db, Constants.get(this.dbStoreName)), orderByKey(), limitToLast(limit + 2)))),
      this.timeoutLimit // Timeout after n seconds
    ).pipe(
      map((data) => {
        if (data === undefined || data === null) {
          return [];
        }
        const readings: DataPointModel[] = Object.values(data.val());
        return readings.slice(0, -2);
      }),
      catchError((err) => {
        console.error(`Error when fetching voltage values from firebase: ${err.message}`);
        return this.indexedDBService.getLast_N_ReadingsExcludingLastTwo(limit, this.chartType);
      })
    );

  }

  generateData(): Observable<DataPointModel> {
    return interval(1000).pipe(
      concatMap(() => {
        return this.uptimeService.getCounterValue().pipe(
          catchError(() => {
            return this.indexedDBService.getUpTime();
          })
        );
      }
      ),
      concatMap((currentUptime) => {
        let data: DataPointModel = { uptime: 0 };
        data[this.chartType] = 0;
        const randomVoltage = (Math.random() * (coefficientMap.get(this.chartType) ?? 5)).toFixed(2); // Generate a random value for the data point. Default to randint between 0 and 5 if the specified type of chart doesn't exist
        data.uptime = currentUptime;
        data[this.chartType] = parseFloat(randomVoltage);
        return of(data);
      })
    );
  }

  saveData(dataPoint: DataPointModel): Observable<boolean> {
    return fetchWithTimeout(
      from(set(ref(this.db, `${Constants.get(this.dbStoreName)}/` + dataPoint.uptime), dataPoint)),
      this.timeoutLimit // Timeout after n seconds
    ).pipe(
      catchError(() => {
        return this.indexedDBService.addReading(dataPoint);
      })
    );
  }

  listenForUpdates(): Observable<DataPointModel[]> {
    //fetch from firebase and return!
    return interval(1000).pipe(
      concatMap(() => {
        return fetchWithTimeout(
          from(get(query(ref(this.db, Constants.get(this.dbStoreName)), orderByKey(), limitToLast(1)))),
          this.timeoutLimit
        ).pipe(
          map((data) => {
            if (data === undefined || data === null || data.val() === null) {
              return [];
            }
            return Object.values(data.val()) as DataPointModel[];
          }),
          catchError(() => {
            return this.indexedDBService.getLast_N_ReadingsExcludingLastTwo(1, this.chartType);
          })
        );
      })
    );
  }

  private _downloadData(data: DataPointModel[]): void {
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.chartType}Readings.json`;
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object after the download
  }


  downloadData(): Observable<void> {
    return fetchWithTimeout(
      from(get(ref(this.db, Constants.get(this.dbStoreName)))),
      this.timeoutLimit
    ).pipe(
      debounceTime(1200),
      map((data) => {
        this._downloadData(Object.values(data.val()));
      }),
      catchError((err) => {
        console.error(`Error when fetching ${this.chartType} from firebase: ${err.message}`);
        return this.indexedDBService.getAllReadings(this.chartType).pipe(
          debounceTime(1200),
          map((data) => {
            this._downloadData(data);
          })
        );
      })
    );
  }

  deleteAllReadings(): Observable<boolean> {
    return merge(
      fetchWithTimeout(from(remove(ref(this.db, Constants.get(this.dbStoreName)))), this.timeoutLimit * 2),
      this.indexedDBService.clearReadings(this.chartType)
    );
  }
}
