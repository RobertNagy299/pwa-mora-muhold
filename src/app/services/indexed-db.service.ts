import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { ChartTypeEnum, Constants } from '../utils/constants';
import { catchError, concat, filter, from, map, Observable, of, shareReplay, switchMap, throwError } from 'rxjs';
import { VoltageInterface } from '../interfaces/VoltageInterface';
import { TemperatureInterface } from '../interfaces/TemperatureInterface';
import { DataPointModel } from './chart-service';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private db: IDBPDatabase | null = null;
  //private dbPromise: Promise<IDBPDatabase>;
  //private dbBehaviorSubject: BehaviorSubject<IDBPDatabase | null> = new BehaviorSubject<IDBPDatabase | null>(null);
  private dbObservable$: Observable<IDBPDatabase | null>; //this.dbBehaviorSubject.asObservable();

  constructor() {
    this.dbObservable$ = this.initDB()
      .pipe(
        shareReplay(1),
      );

  }




  // INITDB MOVED TO RXJS 

  initDB(): Observable<IDBPDatabase<unknown>> {
    return from(
      openDB('my-database', 1, {
        upgrade(db) {
          db.createObjectStore('voltageReadings', { keyPath: 'uptime' });  // Use uptime as the key
          db.createObjectStore('temperatureReadings', { keyPath: 'uptime' });
          db.createObjectStore('uptime', { keyPath: 'id', autoIncrement: true });  // New store for uptime
        },
      }))
  }

  //#region UPTIME OPERATIONS

  // NEW RXJS SAVEUPTIME
  saveUptime(value: number): Observable<boolean> {
    return this.dbObservable$
      .pipe(

        switchMap((myDb) => {
          if (myDb === null) {
            return throwError(() => new Error("Error: null indexedDB"));
          }
          const storeName = Constants.get('uptimeObjectStoreName')

          const tx = myDb.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          return concat(
            from(store.put({ id: 1, value })),
            from(tx.done),

          )

        }),
        map(() => {
          return true
        }),

        catchError((err) => {
          console.error(err)
          return of(false)
        }),
      )

  }


  // Get uptime value from IndexedDB

  //NEW GETUPTIME WITH OBSERVABLES
  getUpTime(): Observable<number> {
    return this.dbObservable$
      .pipe(
        switchMap((myDb) => {
          if (myDb === null) {
            return throwError(() => new Error("Error: indexedDB instance is null"));
          }

          const storeName = Constants.get('uptimeObjectStoreName')

          const tx = myDb.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          return concat(
            from(store.get(1)),
            from(tx.done)
          )
        }),



        filter((object) => {
          return object !== undefined
        }),

        map((object) => {
          return object.value;
        }),

        map((returnValue: number) => { return returnValue }),

        catchError((err) => {
          console.error(`Error fetching uptime from indexedDB: ${err.message}`)
          return of(0)
        })
      )
  }



  //#endregion

  //#region GENERIC DATA OPERATIONS

  addReading(reading: DataPointModel): Observable<boolean> {

    const type: string = Object.keys(reading).filter(x => x !== 'uptime')[0];

    return this.dbObservable$
      .pipe(
        switchMap((myDb) => {
          if (myDb === null) {
            return throwError(() => new Error(`indexedDB is null when trying to add ${type} reading.`));
          }

          const storeName = Constants.get(`${type}ObjectStoreName`);

          const tx = myDb.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);

          return concat(
            from(store.put({ id: reading.uptime, uptime: reading.uptime, voltage: reading[`${type}`] })),  // Save with uptime as the key
            from(tx.done)
          )
        }),

        map(() => { return true }),

        catchError((err) => {
          console.error(`Error caught when trying to add a new ${type} reading to indexedDB: ${err.message}`);
          return of(false);
        })
      )
  }


  getLast_N_ReadingsExcludingLastTwo(limit: number, type: ChartTypeEnum) : Observable<DataPointModel[]> {

    return this.dbObservable$
    .pipe(
      switchMap((myDb) => {
        if (myDb === null) {
          return throwError(() => new Error(`indexedDB instance is null when trying to fetch ${type} readings`));
        }
        return from(myDb.getAll(Constants.get(`${type}ObjectStoreName`)))
      }),

      map((allReadings: DataPointModel[]) => {
        if (allReadings.length <= 2) {
          return [];
        }
        return allReadings.slice(-limit - 2, -2);
      }),

      catchError((err) => {
        console.error(`Error caught when trying to fetch ${type} values from indexeDB: ${err.message}`)
        return of([]);
      })
    )

  }

  getAllReadings(type: ChartTypeEnum): Observable<DataPointModel[]> {
    return this.dbObservable$
      .pipe(
        switchMap((myDb) => {
          if (myDb === null) {
            return throwError(() => new Error(`indexedDB instance is null when trying to fetch all ${type} readings`));
          }
          return from(myDb.getAll(Constants.get(`${type}ObjectStoreName`)));
        }),

        map((allReadings: DataPointModel[]) => {
          return allReadings
        }),

        catchError((err) => {
          console.error(`Error caught when trying to fetch all ${type} values from indexeDB: ${err.message}`)
          return of([]);
        })
      )
  }

  clearReadings(type: ChartTypeEnum): Observable<boolean> {
    return this.dbObservable$
      .pipe(
        switchMap((myDb) => {
          if (myDb === null) {
            return throwError(() => new Error(`Error! IndexedDB instance is null`))
          }
          return myDb.clear(Constants.get(`${type}ObjectStoreName`));
        }),

        map(() => { return true }),

        catchError((err) => {
          console.error(`Error clearing ${type} readings from indexedDB: ${err.message}`);
          return of(false);
        })

      )
  }

  //#endregion

}
