import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatMap, exhaustMap, map, takeUntil } from "rxjs";
import { TemperatureInterface } from "../../interfaces/TemperatureInterface";
import { DataPointModel } from "../../services/chart-service";
import { TemperatureFirebaseService } from "../../services/temperature-firebase.service";
import { Constants } from "../../utils/constants";
import { addTemperaturePoint, deleteAllTemperatureReadingsFromDB, fetchHistoricalTemperatureData, setTemperatureArray, startGeneratingTemperatureData, startListeningForTemperatureDataChanges, stopGeneratingTemperatureData, stopListeningForTemperatureDataChanges } from "./temperature-feature.actions";

@Injectable()
export class TemperatureEffects {

  constructor (
    private readonly actions$: Actions,
    private readonly temperatureService: TemperatureFirebaseService,
  ) { }

  fetchHistoricalData$ = createEffect(() => this.actions$.pipe(
    ofType(fetchHistoricalTemperatureData),
    exhaustMap(() => {
      return this.temperatureService.fetchHistoricalData(Constants.get('dataLimit'));
    }),
    map((data: DataPointModel[]) => {
      return setTemperatureArray({ temperatureArray: data as TemperatureInterface[] });
    })
  ));

  deleteTemperatureData$ = createEffect(() => this.actions$.pipe(
    ofType(deleteAllTemperatureReadingsFromDB),
    exhaustMap(() => {
      return this.temperatureService.deleteAllReadings();
    })
    // reducer takes care of the store
  ), { dispatch: false });

  initializeTemperatureGeneration$ = createEffect(() => this.actions$.pipe(
    ofType(startGeneratingTemperatureData),
    exhaustMap(() => {
      return this.temperatureService.generateData().pipe(
        concatMap((data) => {
          return this.temperatureService.saveData(data);
        }),
        takeUntil(this.actions$.pipe(ofType(stopGeneratingTemperatureData)))
      );
    })
  ), { dispatch: false });

  initializeDataChangeListener = createEffect(() => this.actions$.pipe(
    ofType(startListeningForTemperatureDataChanges),
    exhaustMap(() => {
      return this.temperatureService.listenForUpdates().pipe(
        takeUntil(this.actions$.pipe(ofType(stopListeningForTemperatureDataChanges)))
      );
    }),
    map((data) => {
      return addTemperaturePoint({ data: data as TemperatureInterface[] });
    })
  ));
}
