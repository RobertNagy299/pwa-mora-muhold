import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { ConstantsEnum } from '../utils/constants';
import { catchError, concat, filter, from, map, Observable, of, shareReplay, switchMap, throwError } from 'rxjs';
import { VoltageInterface } from '../interfaces/VoltageInterface';
import { TemperatureInterface } from '../interfaces/TemperatureInterface';

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

  /**
   * ==================================
   * UPTIME OPERATIONS
   * ==================================
   */

  
  // NEW RXJS SAVEUPTIME
  saveUptime(value: number) : Observable<boolean> {
       return this.dbObservable$
      .pipe(
        
        switchMap((myDb) => {
          if (myDb === null) {
            return throwError(() => new Error("Error: null indexedDB")); 
          }
          const tx = myDb.transaction(ConstantsEnum.uptimeObjectStoreName, 'readwrite');
          const store = tx.objectStore(ConstantsEnum.uptimeObjectStoreName);
          return concat(
            from(store.put({id: 1, value})),
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
        const tx = myDb.transaction(ConstantsEnum.uptimeObjectStoreName, 'readonly');
        const store = tx.objectStore(ConstantsEnum.uptimeObjectStoreName);
        return concat(
          from(store.get(1)),
          from(tx.done)
        )
      }),
      


      filter((object)  => {
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

  // clear uptime data

  clearUpTime(): Observable<boolean> {
    return this.dbObservable$
    .pipe(
      switchMap((myDb) => {
        if (myDb === null) {
          return throwError(() => new Error(`Error! IndexedDB instance is null`))
        }
        const tx = myDb.transaction(ConstantsEnum.uptimeObjectStoreName, 'readwrite');
        const store = tx.objectStore(ConstantsEnum.uptimeObjectStoreName);
        return concat(
          from(store.clear()),
          from(tx.done)
        )
      }),

      map(() => {return true}),

      catchError((err) => {
        console.error(`Error clearing uptime from indexedDB: ${err.message}`);
        return of(false);
      })

    )

  }

  /**
   * ==================================
   * VOLTAGE OPERATIONS
   * ==================================
   */

  // Save voltage reading to IndexedDB with uptime as the key
  
  addVoltageReading(reading: VoltageInterface) : Observable<boolean> {
    return this.dbObservable$
    .pipe(
      switchMap((myDb) => {
        if (myDb === null) {
          return throwError(() => new Error("indexedDB is null when trying to add voltage reading."));
        }
        const tx = myDb.transaction(ConstantsEnum.voltageObjectStoreName, 'readwrite');
        const store = tx.objectStore(ConstantsEnum.voltageObjectStoreName);
        
        return concat(
          from(store.put({ id: reading.uptime, uptime: reading.uptime, voltage: reading.voltage })),  // Save with uptime as the key
          from(tx.done)
        )
      }),   

      map(() => {return true}),

      catchError((err) => {
        console.error(`Error caught when trying to add a new voltage reading to indexedDB: ${err.message}`);
        return of(false);
      })
    )
  }


  // Get the last 'N' voltage readings from IndexedDB excluding the last 2
 
  getLastNVoltageReadingsExcludingLast2(limit: number) : Observable<VoltageInterface[]> {
    return this.dbObservable$
    .pipe(
      switchMap((myDb) => {
        if(myDb === null) {
          return throwError(() => new Error("indexedDB instance is null when trying to fetch voltage readings"));
        }
        return from(myDb.getAll(ConstantsEnum.voltageObjectStoreName))
      }),

      map((allReadings: VoltageInterface[]) => {
        if (allReadings.length <= 2) {
          return [];
        }
        return allReadings.slice(-limit - 2, -2);
      }),

      catchError((err) => {
        console.error(`Error caught when trying to fetch voltage values from indexeDB: ${err.message}`)
        return of([]);
      })
    )
  }

  // Get all voltage readings from IndexedDB

  getAllVoltageReadings() : Observable< VoltageInterface[] > {
    return this.dbObservable$
    .pipe(
      switchMap((myDb) => {
        if(myDb === null) {
          return throwError(() => new Error("indexedDB instance is null when trying to fetch all voltage readings"));
        }
        return from(myDb.getAll(ConstantsEnum.voltageObjectStoreName))
      }),

      map((allReadings: VoltageInterface[]) => {
        return allReadings
      }),

      catchError((err) => {
        console.error(`Error caught when trying to fetch all voltage values from indexeDB: ${err.message}`)
        return of([]);
      })
    )
  }


  // Clear voltage readings from IndexedDB

  clearVoltageReadings() : Observable<boolean> {
    return this.dbObservable$
    .pipe(
      switchMap((myDb) => {
        if (myDb === null) {
          return throwError(() => new Error(`Error! IndexedDB instance is null`))
        }
        return myDb.clear(ConstantsEnum.voltageObjectStoreName);
      }),

      map(() => {return true}),

      catchError((err) => {
        console.error(`Error clearing voltage readings from indexedDB: ${err.message}`);
        return of(false);
      })

    )
  }

  /**
   * ==================================
   * TEMPERATURE OPERATIONS
   * ==================================
   */

  // Save temperature reading to IndexedDB with uptime as the key

  addTemperatureReading(reading: TemperatureInterface) : Observable<boolean> {
    return this.dbObservable$
    .pipe(
      switchMap((myDb) => {
        if (myDb === null) {
          return throwError(() => new Error("indexedDB is null when trying to add temperature reading."));
        }
        const tx = myDb.transaction(ConstantsEnum.temperatureObjectStoreName, 'readwrite');
        const store = tx.objectStore(ConstantsEnum.temperatureObjectStoreName);
        
        return concat(
          from(store.put({ id: reading.uptime, uptime: reading.uptime, voltage: reading.temperature })),  // Save with uptime as the key
          from(tx.done)
        )
      }),   

      map(() => {return true}),

      catchError((err) => {
        console.error(`Error caught when trying to add a new temperature reading to indexedDB: ${err.message}`);
        return of(false);
      })
    )
  }

  // Delete all temperature readings from IndexedDB

  clearTemperatureReadings() : Observable<boolean> {

    return this.dbObservable$
    .pipe(
      switchMap((myDb) => {
        if (myDb === null) {
          return throwError(() => new Error(`Error! IndexedDB instance is null`))
        }
        return myDb.clear(ConstantsEnum.temperatureObjectStoreName);
      }),

      map(() => {return true}),

      catchError((err) => {
        console.error(`Error clearing temperature readings from indexedDB: ${err.message}`);
        return of(false);
      })

    )

  }


  // Get the last N-2 temperature readings from IndexedDB
  // Used for the chart / plot / graph
  getLastNTemperatureReadingsExcludingLast2(limit: number) : Observable< TemperatureInterface[] > {
    return this.dbObservable$
    .pipe(
      switchMap((myDb) => {
        if(myDb === null) {
          return throwError(() => new Error("indexedDB instance is null when trying to fetch temperature readings"));
        }
        return from(myDb.getAll(ConstantsEnum.temperatureObjectStoreName))
      }),

      map((allReadings: TemperatureInterface[]) => {
        if (allReadings.length <= 2) {
          return [];
        }
        return allReadings.slice(-limit - 2, -2);
      }),

      catchError((err) => {
        console.error(`Error caught when trying to fetch temperature values from indexeDB: ${err.message}`)
        return of([]);
      })
    )
  }

  // Get all temperature readings from IndexedDB

  getAllTemperatureReadings() : Observable <TemperatureInterface[]> {
    return this.dbObservable$
    .pipe(
      switchMap((myDb) => {
        if(myDb === null) {
          return throwError(() => new Error("indexedDB instance is null when trying to fetch all temperature readings"));
        }
        return from(myDb.getAll(ConstantsEnum.temperatureObjectStoreName))
      }),

      map((allReadings: TemperatureInterface[]) => {
        return allReadings
      }),

      catchError((err) => {
        console.error(`Error caught when trying to fetch all temperature values from indexeDB: ${err.message}`)
        return of([]);
      })
    )
  }

}
