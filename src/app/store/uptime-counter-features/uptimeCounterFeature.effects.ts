import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, combineLatestWith, exhaustMap, filter, interval, map, of } from "rxjs";
import { UptimeService } from "../../services/uptime.service";
import { MyStoreInterface } from "../app.store";
import { incrementUptime, loadUptime, resetUptime, setUptime, startIncrementing } from "./uptimeCounterFeature.actions";
import { selectUptime } from "./uptimeCounterFeature.selectors";


@Injectable()
export class UptimeEffects {

  constructor (
    private actions$: Actions,
    private uptimeService: UptimeService,
    private store: Store<MyStoreInterface>) { }

  resetUptime$ = createEffect(() => this.actions$.pipe(
    ofType(resetUptime),
    exhaustMap(() => {
      return this.uptimeService.resetCounterValue();
    })
  ), { dispatch: false });

  loadData$ = createEffect(() => this.actions$.pipe(
    ofType(loadUptime.type),
    exhaustMap(() => this.uptimeService.getCounterValue()
      .pipe(
        catchError(() => of(-1))
      )
    ),
    map(uptime => {
      if (uptime <= 0) {
        return setUptime({ newValue: 1 });
      }
      return setUptime({ newValue: uptime });
    })
  ));

  startIncrementing$ = createEffect(() => this.actions$.pipe(
    ofType(startIncrementing.type),
    combineLatestWith(this.store.select(selectUptime)), // Get latest value once
    filter(([_, uptime]) => uptime !== 0), // Prevent if uptime is 0
    exhaustMap(() => interval(1000).pipe(
      map(() => incrementUptime()) // Dispatch an action instead of modifying the store directly
    ))
  ));

  incrementUptime$ = createEffect(() => this.actions$.pipe(
    ofType(incrementUptime.type),
    combineLatestWith(this.store.select(selectUptime)),
    exhaustMap(([_, uptime]) => {
      return this.uptimeService.saveCounterValue(uptime);
    })
  ), { dispatch: false });
}