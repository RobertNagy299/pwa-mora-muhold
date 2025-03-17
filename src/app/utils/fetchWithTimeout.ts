import {map, Observable, race, throwError, timer } from "rxjs";

export function fetchWithTimeout(observable: Observable<any>, timeout: number) : Observable<any> {
  
  const timeOutObservable = timer(timeout).pipe(map(() => {throwError(() => new Error("Timer won!"))}));

  return race(timeOutObservable, observable);
}