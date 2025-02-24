import { Injectable, OnInit} from '@angular/core';
import {Database, ref, set, get, query, orderByKey, limitToLast, remove} from '@angular/fire/database';
import { catchError, concatMap, debounceTime, filter, from, interval, map, merge, Observable, throttleTime } from 'rxjs';

import Chart from 'chart.js/auto';
//import { Chart, LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js';
import {UptimeService} from './uptime.service';

import {IndexedDBService} from './indexed-db.service'; // Import necessary Chart.js components
import {fetchWithTimeout} from '../utils/fetchWithTimeout';
import {ConstantsEnum} from '../utils/constants';
import { TemperatureInterface } from '../interfaces/TemperatureInterface';

@Injectable({
  providedIn: 'root'
})
export class TemperatureFirebaseService{

  private chart: Chart | null = null;



  constructor(private uptimeService: UptimeService,
              private db: Database,
              private indexedDBService: IndexedDBService) {}

  // Create the chart instance and set its initial configuration
  createChart(chartElement: HTMLCanvasElement): void {
    this.chart = new Chart(chartElement, {
      type: 'line',
      data: {
        labels: [], // X axis: Uptime values (timestamp)
        datasets: [
          {
            label: 'Temperature',
            data: [], // Y axis: Temperature values
            borderColor: 'rgb(255,110,17)',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        animation: {
          duration: 0,
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Uptime (s)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Temperature (°C)',
            },
          },
        },
      },
    });
  }



  fetchHistoricalData(limit: number) : Observable<TemperatureInterface[]> {
        return fetchWithTimeout(
          from(get(query(ref(this.db, ConstantsEnum.temperatureObjectStoreName), orderByKey(), limitToLast(limit + 2)))),
          ConstantsEnum.timeoutLimit // Timeout after n seconds
        ).pipe(
          
          map((data) => {
                  // console.log(`Data in fetchHistorical = ${data}`);
                   if (data === undefined || data === null || data.val() === null) {
                
                    return this.uptimeService.getCounterValue();
                   }
                   console.log("Data found, historical fetch is successful")
                   const readings: TemperatureInterface[] = Object.values(data.val());
                   return readings.slice(0, -2)
           }),

           filter((data) => typeof(data) === 'number'),

           map((currentTime) => {
            let temp = 0;
            let initialTemp : TemperatureInterface = {uptime: currentTime, temperature: temp};
            console.log(`inital temp = ${JSON.stringify(initialTemp)}`);
            return [initialTemp];
           }),
         
  
          catchError((err) => {
            console.error(`Error when fetching temperature values from firebase: ${err.message}`);
            return this.indexedDBService.getLastNTemperatureReadingsExcludingLast2(limit);
          })
        )
      
    }
  
    generateTemperatureData(): Observable<void> {
      //generate random values and upload them to firebase
  
      return interval(1000).pipe(
        
        concatMap( () => {
            return this.uptimeService.getCounterValue() 
          }
        ),
  
        concatMap((currentUptime: number) => {
          let temperatureData: TemperatureInterface = {uptime: 0, temperature: 0};
          const randomTemperature = (Math.random()*40*(Math.random() < 0.5 ? -1 : 1)).toFixed(2); // Generate a random temperature value between -40 and + 40 degrees Celsius

          temperatureData.uptime = currentUptime;
          temperatureData.temperature = parseFloat(randomTemperature);
  
          return fetchWithTimeout(
            from(set(ref(this.db, `${ConstantsEnum.temperatureObjectStoreName}/` + temperatureData.uptime), temperatureData)),
            ConstantsEnum.timeoutLimit // Timeout after n seconds
          )
        })
      )
    }


  listenForTemperatureUpdates() : Observable<TemperatureInterface[]> {
    //fetch from firebase and return!
    return interval(1000).pipe(
      concatMap(() => {
        return fetchWithTimeout(
          from(get(query(ref(this.db, ConstantsEnum.temperatureObjectStoreName), orderByKey(), limitToLast(1)))),
          ConstantsEnum.timeoutLimit
        ).pipe(
          map((data) => {
            
            if (data === undefined || data === null || data.val() === null) {
              return [];
            }
            return Object.values(data.val()) as TemperatureInterface[];
          })
          
        )
      })
      
    ) 
  
  }
  // Update the chart with new temperature readings from Firebase
  updateChart(data: TemperatureInterface[]): void { // used to be any[]
    if (this.chart && data.length > 0) {
      data.forEach((reading: TemperatureInterface) => {
        const uptime = reading.uptime;
        const temperature = reading.temperature;

        // Update chart with new data
        if(this.chart !== null && this.chart.data.labels !== undefined) {
          this.chart.data.labels.push(uptime);
          this.chart.data.datasets[0].data.push(temperature);
          this.chart.update();
        }

      });
    }
  }


  // Download temperature readings as JSON for logged-in users

  downloadTemperatureData() : Observable<void> {
    
    return fetchWithTimeout(
      from(get(ref(this.db, ConstantsEnum.temperatureObjectStoreName))), 
      ConstantsEnum.timeoutLimit
    ).pipe(

      // Debounce is not working
      debounceTime(1200),
      
      map((data) => {
        this.downloadData(Object.values(data.val()));
      }),

      catchError((err) => {

        console.error(`Error when fetching temperature from firebase: ${err.message}`);
        
        return this.indexedDBService.getAllTemperatureReadings().pipe(
          
          debounceTime(1200),

          map((data) => {
            this.downloadData(data)
          })
        )
        
      })
    )
  }

  private downloadData(data: any[]): void {
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'temperatureReadings.json';
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object after the download
  }



  deleteAllTemperatureReadings(): Observable<boolean> {
    return merge(
      fetchWithTimeout( from( remove(ref(this.db, ConstantsEnum.temperatureObjectStoreName))), ConstantsEnum.timeoutLimit*2),
      this.indexedDBService.clearTemperatureReadings()
    )
  }
  

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
