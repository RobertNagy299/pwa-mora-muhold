import {inject, Injectable} from '@angular/core';
import {Database, ref, set, get, query, orderByKey, limitToLast, remove} from '@angular/fire/database';
import { Observable } from 'rxjs';

import Chart from 'chart.js/auto';
//import { Chart, LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js';
import {UptimeService} from './uptime.service';
import {HomeComponent} from '../components/home/home.component'; // Import necessary Chart.js components


@Injectable({
  providedIn: 'root'
})
export class TemperatureFirebaseService {

  private chart: Chart | null = null;
  private homeComponent = inject(HomeComponent);

  constructor(private uptimeService: UptimeService,private db: Database) {}

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

  // Fetch the last 'N' historical temperature data from Firebase, omitting the last 2 most recent readings
  async fetchHistoricalData(limit: number): Promise<any[]> {
    const temperatureRef = ref(this.db, 'temperatureReadings');
    const temperatureQuery = query(temperatureRef, orderByKey(), limitToLast(limit + 2));
    const snapshot = await get(temperatureQuery);
    const data = snapshot.val();
    if (!data) {
      return [];
    }
    const allReadings = Object.values(data);
    return allReadings.slice(0, -2); // Omit the last 2 readings
  }

  // Listen for temperature updates from Firebase and update the chart
  listenForTemperatureUpdates(): Observable<any[]> {
    ref(this.db, 'temperatureReadings');
    return new Observable<any[]>((observer) => {
      setInterval(async () => {
        const randomTemperature = (Math.random()*40*(Math.random() < 0.5 ? -1 : 1)).toFixed(2); // Generate a random temperature value between -40 and 40 degrees celsius
        const currentUptime = await this.uptimeService.getCounterValue();
        const temperatureData = {
          uptime: currentUptime, // Use the current timestamp as uptime
          temperature: parseFloat(randomTemperature), // Parse the temperature as a float
        };

        // Save the new temperature reading to Firebase
        await set(ref(this.db, 'temperatureReadings/' + temperatureData.uptime), temperatureData);

        observer.next([temperatureData]);
      }, 1000); // Update every second
    });
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


  // Download temperature readings as JSON for logged-in users
  downloadTemperatureData(): void {
    const temperatureRef = ref(this.db, 'temperatureReadings');
    get(temperatureRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const jsonData = JSON.stringify(Object.values(data)); // Convert object to array if needed
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'temperatureReadings.json';
        a.click();
        URL.revokeObjectURL(url); // Clean up the URL object after the download
      }
    });
  }

  async deleteAllTemperatureReadings(): Promise<void> {
    const temperatureRef = ref(this.db, 'temperatureReadings');
    await remove(temperatureRef);
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
