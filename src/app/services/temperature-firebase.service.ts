import { Injectable } from '@angular/core';

import { ChartTypeEnum } from '../utils/constants';
import { ChartService } from './chart-service';

@Injectable({
  providedIn: 'root'
})
export class TemperatureFirebaseService extends ChartService {

 
  constructor(
    // private uptimeService: UptimeService,
    // private db: Database,
    // private indexedDBService: IndexedDBService
  ) {
    super(ChartTypeEnum.TEMPERATURE);
  }





  // fetchHistoricalData(limit: number) : Observable<TemperatureInterface[]> {
  //       return fetchWithTimeout(
  //         from(get(query(ref(this.db, Constants.temperatureObjectStoreName), orderByKey(), limitToLast(limit + 2)))),
  //         Constants.timeoutLimit // Timeout after n seconds
  //       ).pipe(

  //         map((data) => {
  //                 // console.log(`Data in fetchHistorical = ${data}`);
  //                  if (data === undefined || data === null || data.val() === null) {

  //                   return this.uptimeService.getCounterValue();
  //                  }
  //                  console.log("Data found, historical fetch is successful")
  //                  const readings: TemperatureInterface[] = Object.values(data.val());
  //                  return readings.slice(0, -2)
  //          }),

  //          filter((data) => typeof(data) === 'number'),

  //          map((currentTime) => {
  //           let temp = 0;
  //           let initialTemp : TemperatureInterface = {uptime: currentTime, temperature: temp};
  //           console.log(`inital temp = ${JSON.stringify(initialTemp)}`);
  //           return [initialTemp];
  //          }),


  //         catchError((err) => {
  //           console.error(`Error when fetching temperature values from firebase: ${err.message}`);
  //           return this.indexedDBService.getLastNTemperatureReadingsExcludingLast2(limit);
  //         })
  //       )

  //   }

  //   generateTemperatureData(): Observable<void> {
  //     //generate random values and upload them to firebase

  //     return interval(1000).pipe(

  //       concatMap( () => {
  //           return this.uptimeService.getCounterValue() 
  //         }
  //       ),

  //       concatMap((currentUptime: number) => {
  //         let temperatureData: TemperatureInterface = {uptime: 0, temperature: 0};
  //         const randomTemperature = (Math.random()*40*(Math.random() < 0.5 ? -1 : 1)).toFixed(2); // Generate a random temperature value between -40 and + 40 degrees Celsius

  //         temperatureData.uptime = currentUptime;
  //         temperatureData.temperature = parseFloat(randomTemperature);

  //         return fetchWithTimeout(
  //           from(set(ref(this.db, `${Constants.temperatureObjectStoreName}/` + temperatureData.uptime), temperatureData)),
  //           Constants.timeoutLimit // Timeout after n seconds
  //         )
  //       })
  //     )
  //   }


  // listenForTemperatureUpdates() : Observable<TemperatureInterface[]> {
  //   //fetch from firebase and return!
  //   return interval(1000).pipe(
  //     concatMap(() => {
  //       return fetchWithTimeout(
  //         from(get(query(ref(this.db, Constants.temperatureObjectStoreName), orderByKey(), limitToLast(1)))),
  //         Constants.timeoutLimit
  //       ).pipe(
  //         map((data) => {

  //           if (data === undefined || data === null || data.val() === null) {
  //             return [];
  //           }
  //           return Object.values(data.val()) as TemperatureInterface[];
  //         }),


  //       )
  //     })

  //   ) 

  // }


  // // Download temperature readings as JSON for logged-in users

  // downloadTemperatureData() : Observable<void> {

  //   return fetchWithTimeout(
  //     from(get(ref(this.db, Constants.temperatureObjectStoreName))), 
  //     Constants.timeoutLimit
  //   ).pipe(

  //     // Debounce is not working
  //     debounceTime(1200),

  //     map((data) => {
  //       this.downloadData(Object.values(data.val()));
  //     }),

  //     catchError((err) => {

  //       console.error(`Error when fetching temperature from firebase: ${err.message}`);

  //       return this.indexedDBService.getAllTemperatureReadings().pipe(

  //         debounceTime(1200),

  //         map((data) => {
  //           this.downloadData(data)
  //         })
  //       )

  //     })
  //   )
  // }

  // private downloadData(data: any[]): void {
  //   const jsonData = JSON.stringify(data);
  //   const blob = new Blob([jsonData], { type: 'application/json' });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'temperatureReadings.json';
  //   a.click();
  //   URL.revokeObjectURL(url); // Clean up the URL object after the download
  // }



  // deleteAllTemperatureReadings(): Observable<boolean> {
  //   return merge(
  //     fetchWithTimeout( from( remove(ref(this.db, Constants.temperatureObjectStoreName))), Constants.timeoutLimit*2),
  //     this.indexedDBService.clearTemperatureReadings()
  //   )
  // }


  // // teacher's material
  // private readonly collectionName = 'voltage';
  // constructor(private readonly fireStore: Firestore) { }
  //
  // public saveVoltage(voltage: VoltageInterface){
  //
  //   //Puts an object into a collection, returns with a promise
  //   //from -> creates an observable from a promise
  //   return from(addDoc(collection(this.fireStore, this.collectionName), voltage));
  //
  // }
  //
  // public getAllVoltageValues(){
  //   return from(getDocs(query(collection(this.fireStore, this.collectionName))))
  //     .pipe(map(snapShot => snapShot.docs.map( (voltage) => voltage.data() as VoltageInterface ))
  //     ,catchError(()=>of([])));
  // }

  // TODO firebase init hosting, dist/mora-muhold, firebase deploy --only hosting



}
