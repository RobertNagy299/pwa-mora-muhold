import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatMap, exhaustMap, map, takeUntil } from "rxjs";
import { VoltageInterface } from "../../interfaces/VoltageInterface";
import { DataPointModel } from "../../services/chart-service";
import { VoltageFirebaseService } from "../../services/voltage-firebase.service";
import { Constants } from "../../utils/constants";
import { addVoltagePoint, deleteAllVoltageReadingsFromDB, fetchHistoricalVoltageData, setVoltageArray, startGeneratingData, startListeningForVoltageDataChanges, stopGeneratingData, stopListeningForVoltageDataChanges } from "./voltage-feature.actions";

@Injectable()
export class VoltageEffects {

  constructor (
    private readonly actions$: Actions,
    private readonly voltageService: VoltageFirebaseService,
  ) { }

  fetchHistoricalData$ = createEffect(() => this.actions$.pipe(
    ofType(fetchHistoricalVoltageData),
    exhaustMap(() => {
      return this.voltageService.fetchHistoricalData(Constants.get('dataLimit'));
    }),
    map((data: DataPointModel[]) => {
      return setVoltageArray({ voltageArray: data as VoltageInterface[] });
    })
  ));

  deleteVoltageData$ = createEffect(() => this.actions$.pipe(
    ofType(deleteAllVoltageReadingsFromDB),
    exhaustMap(() => {
      return this.voltageService.deleteAllReadings();
    })
    // reducer takes care of the store
  ), { dispatch: false });

  initializeVoltageGeneration$ = createEffect(() => this.actions$.pipe(
    ofType(startGeneratingData),
    exhaustMap(() => {
      return this.voltageService.generateData().pipe(
        concatMap((data) => {
          return this.voltageService.saveData(data);
        }),
        takeUntil(this.actions$.pipe(ofType(stopGeneratingData)))
      );
    })
  ), { dispatch: false });

  initializeDataChangeListener = createEffect(() => this.actions$.pipe(
    ofType(startListeningForVoltageDataChanges),
    exhaustMap(() => {
      return this.voltageService.listenForUpdates().pipe(
        takeUntil(this.actions$.pipe(ofType(stopListeningForVoltageDataChanges)))
      );
    }),

    map((data) => {
      return addVoltagePoint({ data: data as VoltageInterface[] });
    })
  ));

}