import { Injectable} from '@angular/core';
import {Database, ref, set, get, query, orderByKey, limitToLast, remove} from '@angular/fire/database';
import { catchError, concatMap, from, interval, map, merge, Observable } from 'rxjs';

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
export class TemperatureFirebaseService {

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



  // OLD VERSION - WORKS FINE


  // async fetchHistoricalData(limit: number): Promise<any[]> {
  //   try {
  //     const data = await fetchWithTimeout(
  //       get(query(ref(this.db, ConstantsEnum.temperatureObjectStoreName), orderByKey(), limitToLast(limit + 2))),
  //       ConstantsEnum.timeoutLimit // Timeout after n seconds
  //     );
  //     const readings = Object.values(data.val());
  //     return readings.slice(0, -2); // Omit the last 2 readings
  //   } catch (error) {
  //     // console.error('Fetching data from Firebase failed, falling back to IndexedDB', error);
  //     return this.indexedDBService.getLastNTemperatureReadingsExcludingLast2(limit);
  //   }
  // }

  fetchHistoricalData(limit: number) : Observable<TemperatureInterface[]> {
        return fetchWithTimeout(
          from(get(query(ref(this.db, ConstantsEnum.temperatureObjectStoreName), orderByKey(), limitToLast(limit + 2)))),
          ConstantsEnum.timeoutLimit // Timeout after n seconds
        ).pipe(
          
          map((data) => {
            const readings: TemperatureInterface[] = Object.values(data.val());
            return readings.slice(0, -2)
          }),
  
          catchError((err) => {
            console.error(`Error when fetching temperature values from firebase: ${err.message}`);
            return this.indexedDBService.getLastNTemperatureReadingsExcludingLast2(limit);
          })
        )
      
    }
  

  // Listen for temperature updates from Firebase and update the chart

    // OLD BUT GOLD

  // listenForTemperatureUpdates(): Observable<any[]> {
  //   ref(this.db, ConstantsEnum.temperatureObjectStoreName);
  //   return new Observable<any[]>((observer) => {
  //     setInterval(async () => {
  //       const randomTemperature = (Math.random()*40*(Math.random() < 0.5 ? -1 : 1)).toFixed(2); // Generate a random temperature value between -40 and 40 degrees celsius
  //       const currentUptime = await this.uptimeService.getCounterValue();
  //       const temperatureData = {
  //         uptime: currentUptime, // Use the current timestamp as uptime
  //         temperature: parseFloat(randomTemperature), // Parse the temperature as a float
  //       };

  //       try {
  //         await fetchWithTimeout(
  //           set(ref(this.db, `${ConstantsEnum.temperatureObjectStoreName}/` + temperatureData.uptime), temperatureData),
  //           ConstantsEnum.timeoutLimit // Timeout after n seconds
  //         );
  //       } catch (error) {
  //         //console.error('Saving data to Firebase failed, saving to IndexedDB', error);
  //         await this.indexedDBService.addTemperatureReading(temperatureData);
  //       }

  //       observer.next([temperatureData]);
  //     }, 1000); // Update every second
  //   });
  // }


  listenForTemperatureUpdates() : Observable<any> {
    
    let temperatureData: TemperatureInterface;


    return interval(1000)
    .pipe(
      
      concatMap( () =>
        this.uptimeService.getCounterValue()
      ),
      concatMap((currentUptime: number) => {

          const randomTemperature = (Math.random()*40*(Math.random() < 0.5 ? -1 : 1)).toFixed(2); // Generate a random temperature value between -40 and + 40 degrees Celsius

          temperatureData = {
            uptime: currentUptime, // Use the current timestamp as uptime
            temperature: parseFloat(randomTemperature), // Parse the temperature as a float
          };

        return fetchWithTimeout(
                    from(set(ref(this.db, `${ConstantsEnum.temperatureObjectStoreName}/` + temperatureData.uptime), temperatureData)),
                    ConstantsEnum.timeoutLimit // Timeout after n seconds
                  ).pipe(
                    catchError((err) => {
                      console.error('Saving data to Firebase failed, saving to IndexedDB ', err.message);
                      return this.indexedDBService.addTemperatureReading(temperatureData);
              
                    })
                  )
      }),

     
    )
  }


  // Update the chart with new temperature readings from Firebase
  updateChart(data: any[]): void {
    if (this.chart) {
      data.forEach((reading: any) => {
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


  // // Download temperature readings as JSON for logged-in users

  // OLD BUT GOLD

  // async downloadTemperatureData(): Promise<void> {
  //   try {
  //     const data = await fetchWithTimeout(get(ref(this.db, ConstantsEnum.temperatureObjectStoreName)), ConstantsEnum.timeoutLimit);
  //     this.downloadData(Object.values(data.val()));
  //   } catch (error) {
  //     //console.error('Fetching data from Firebase failed, falling back to IndexedDB', error);
  //     const data = await this.indexedDBService.getAllTemperatureReadings();
  //     this.downloadData(data);
  //   }
  // }

  downloadTemperatureData() : Observable<void> {
    
    

    return fetchWithTimeout(
      from(get(ref(this.db, ConstantsEnum.temperatureObjectStoreName))), 
      ConstantsEnum.timeoutLimit
    ).pipe(

      map((data) => {
        this.downloadData(Object.values(data.val()));
      }),

      catchError((err) => {

        console.error(`Error when fetching temperature from firebase: ${err.message}`);
        
        return this.indexedDBService.getAllTemperatureReadings().pipe(
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


  // OLD BUT GOLD

  // async deleteAllTemperatureReadings(): Promise<void> {
  //   await fetchWithTimeout( remove(ref(this.db, ConstantsEnum.temperatureObjectStoreName)), ConstantsEnum.timeoutLimit*2);
  //   await this.indexedDBService.clearTemperatureReadings();
  // }


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
