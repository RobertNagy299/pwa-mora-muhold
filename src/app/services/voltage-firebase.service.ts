import {Injectable} from '@angular/core';
import {Database, ref, set, get, query, orderByKey, limitToLast, remove} from '@angular/fire/database';
import { Observable } from 'rxjs';

import Chart from 'chart.js/auto';
//import { Chart, LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js';
import {UptimeService} from './uptime.service';
import {IndexedDBService} from './indexed-db.service';
import {ConstantsEnum} from '../utils/constants';
import {fetchWithTimeout} from '../utils/fetchWithTimeout';

// Import necessary Chart.js components


@Injectable({
  providedIn: 'root'
})
export class VoltageFirebaseService {

  private chart: Chart | null = null;

  constructor(private uptimeService: UptimeService,
              private db: Database,
              private indexedDBService: IndexedDBService
  ) {}

  // Create the chart instance and set its initial configuration
  createChart(chartElement: HTMLCanvasElement): void {
    this.chart = new Chart(chartElement, {
      type: 'line',
      data: {
        labels: [], // X axis: Uptime values (timestamp)
        datasets: [
          {
            label: 'Voltage',
            data: [], // Y axis: Voltage values
            borderColor: 'rgb(75, 192, 192)',
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
              text: 'Voltage (V)',
            },
          },
        },
      },
    });
  }

  async fetchHistoricalData(limit: number): Promise<any[]> {
    try {
      const data = await fetchWithTimeout(
        get(query(ref(this.db, ConstantsEnum.voltageObjectStoreName), orderByKey(), limitToLast(limit + 2))),
        ConstantsEnum.timeoutLimit // Timeout after n seconds
      );
      const readings = Object.values(data.val());
      return readings.slice(0, -2); // Omit the last 2 readings
    } catch (error) {
     // console.error('Fetching data from Firebase failed, falling back to IndexedDB', error);
      return this.indexedDBService.getLastNVoltageReadingsExcludingLast2(limit);
    }
  }

  // Listen for voltage updates from Firebase or generate random data if offline
  listenForVoltageUpdates(): Observable<any[]> {
    return new Observable<any[]>((observer) => {
      setInterval(async () => {
        const randomVoltage = (Math.random() * 5).toFixed(2); // Generate a random voltage between 0 and 5 volts
        const currentUptime = await this.uptimeService.getCounterValue();
        const voltageData = {
          uptime: currentUptime, // Use the current timestamp as uptime
          voltage: parseFloat(randomVoltage), // Parse the voltage as a float
        };

        try {
          await fetchWithTimeout(
            set(ref(this.db, `${ConstantsEnum.voltageObjectStoreName}/` + voltageData.uptime), voltageData),
            ConstantsEnum.timeoutLimit // Timeout after n seconds
          );
        } catch (error) {
          //console.error('Saving data to Firebase failed, saving to IndexedDB', error);
          await this.indexedDBService.addVoltageReading(voltageData);
        }

        observer.next([voltageData]);
      }, 1000); // Update every second
    });
  }



  // Update the chart with new voltage readings from Firebase
  updateChart(data: any[]): void {
    if (this.chart) {
      data.forEach((reading: any) => {
        const uptime = reading.uptime;
        const voltage = reading.voltage;

        // Update chart with new data
        if(this.chart !== null && this.chart.data.labels !== undefined) {
          this.chart.data.labels.push(uptime);
          this.chart.data.datasets[0].data.push(voltage);
          this.chart.update();
        }

      });
    }
  }


  // Download voltage readings as JSON for logged-in users
  async downloadVoltageData(): Promise<void> {
    try {
      const data = await fetchWithTimeout(get(ref(this.db, ConstantsEnum.voltageObjectStoreName)), ConstantsEnum.timeoutLimit);
      this.downloadData(Object.values(data.val()));
    } catch (error) {
      //console.error('Fetching data from Firebase failed, falling back to IndexedDB', error);
      const data = await this.indexedDBService.getAllVoltageReadings();
      this.downloadData(data);
    }
  }

  private downloadData(data: any[]): void {
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voltageReadings.json';
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object after the download
  }
  async deleteAllVoltageReadings(): Promise<void> {
    await fetchWithTimeout( remove(ref(this.db, ConstantsEnum.voltageObjectStoreName)), ConstantsEnum.timeoutLimit*2);
    await this.indexedDBService.clearVoltageReadings();
  }
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
