import {from, map, Observable, race, throwError, timer } from "rxjs";

// OLD, WORKS FINE
// export function fetchWithTimeout(promise: Promise<any>, timeout: number): Promise<any> {
//   const timeoutPromise = new Promise((_, reject) =>

//     setTimeout(() => reject(new Error('Request timed out')), timeout)
  
//   );
//   return Promise.race([promise, timeoutPromise]);
// }

export function fetchWithTimeout(observable: Observable<any>, timeout: number) : Observable<any> {
  
  const timeOutObservable = timer(timeout).pipe(map(() => {throwError(() => new Error("Timer won!"))}));

  return race(timeOutObservable, observable);
}