import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, combineLatestWith, exhaustMap, filter, interval, map, of } from "rxjs";
import { UptimeService } from "../../services/uptime.service";
import { MyStoreInterface } from "../app.store";
import { incrementUptime, loadUptime, setUptime, startIncrementing } from "./uptimeCounterFeature.actions";
import { selectUptime } from "./uptimeCounterFeature.selectors";


@Injectable()
export class UptimeEffects {

  constructor(private actions$: Actions, private uptimeService: UptimeService, private store: Store<MyStoreInterface>) {

  }


  loadData$ = createEffect(() => this.actions$.pipe(
    ofType(loadUptime.type),
    exhaustMap(() => this.uptimeService.getCounterValue()
      .pipe(
        // map((uptime) => ({type: `${loadUptime.type} Success`, payload: uptime})),
        catchError(() => of(-1))
      )
    ),
    map(uptime => {

      if (uptime <= 0) {
        return setUptime({ newValue: 1 });
      }
      return setUptime({ newValue: uptime })
    })
  ))



  startIncrementing$ = createEffect(() => this.actions$.pipe(
    ofType(startIncrementing.type),
    combineLatestWith(this.store.select(selectUptime)), // Get latest value once
    //  tap(([_, uptime]) => console.log("after withLatestFrom = ", uptime)),
    filter(([_, uptime]) => uptime !== 0), // Prevent if uptime is 0
    exhaustMap(() => interval(1000).pipe(

      //tap(() => console.log("inside interval")),
      map(() => incrementUptime()) // Dispatch an action instead of modifying the store directly
    ))
  ));

  incrementUptime$ = createEffect(() => this.actions$.pipe(
    ofType(incrementUptime.type),
    combineLatestWith(this.store.select(selectUptime)),
    exhaustMap(([_, uptime]) => {
      return this.uptimeService.saveCounterValue(uptime)
    })
  ), { dispatch: false })




  // startIncrementing$ = createEffect(() => this.actions$.pipe(
  //     ofType(startIncrementing.type),

  //     switchMap(() => {
  //         return this.store.pipe(

  //             select(selectUptime),
  //             // [0]
  //             // 0, [1]
  //             // 0, [x]
  //             // [1]
  //             // [x]
  //             distinctUntilChanged(),
  //             first()
  //         );
  //     }),
  //     filter((value: number) => value !== 0),
  //     first(),
  //     switchMap(() => {

  //         return interval(1000).pipe(
  //             switchMap(() => {
  //                 console.log("ASD inside interval in ngrx"); // is logged correctly
  //                 return this.store.pipe(
  //                     select(selectUptime),
  //                     first(),
  //                 )

  //             }),
  //             map((uptime: number) => {
  //                 // logged 561999 times
  //                 console.log('in store.dispatch in interval');
  //                 //setUptime({newValue: uptime + 1}) // this line causes an infinite loop
  //             })

  //         )
  //     }),


  // ), { dispatch: false })


  // {
  //      interval(1000)
  //     .pipe(
  //       tap(() => {
  //        // console.log("Signal is being updated inside the homeService");
  //         this.count.update(value => value + 1);
  //       }),
  //       concatMap(() =>{
  //         return this.saveCounterValue();
  //       })

  //     ).subscribe()
  //   }
}