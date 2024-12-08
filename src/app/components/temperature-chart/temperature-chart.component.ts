import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {TemperatureFirebaseService} from '../../services/temperature-firebase.service';

@Component({
  selector: 'app-temperature-chart',
  standalone: true,
  imports: [
    MatIcon,
    MatButton,
    NgIf
  ],
  templateUrl: './temperature-chart.component.html',
  styleUrl: './temperature-chart.component.scss'
})
export class TemperatureChartComponent implements OnInit, OnDestroy {

  private temperatureSubscription: Subscription | null = null;
  protected isLoggedIn = false;
  private readonly DATA_LIMIT = 30; // Number of readings to fetch

  constructor(private authService: AuthService ,private temperatureChartService: TemperatureFirebaseService,
              private el: ElementRef) {}


  ngOnInit(): void {
    const canvas = this.el.nativeElement.querySelector('#realtimeTemperatureChart');

    // Initialize the chart
    this.temperatureChartService.createChart(canvas);

    // Fetch historical data and update the chart
    this.temperatureChartService.fetchHistoricalData(this.DATA_LIMIT).then((historicalData) => {
      this.temperatureChartService.updateChart(historicalData);
    });
    // Listen for voltage updates and update the chart
    this.temperatureSubscription = this.temperatureChartService.listenForTemperatureUpdates().subscribe((data) => {
      this.temperatureChartService.updateChart(data);
    });

    // Check authentication status
    this.authService.authState$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }
  // Method to trigger download for logged-in users
  downloadTemperatureData(): void {
    this.temperatureChartService.downloadTemperatureData();
  }

  ngOnDestroy(): void {
    // Unsubscribe from the voltage updates when the component is destroyed
    if (this.temperatureSubscription) {
      this.temperatureSubscription.unsubscribe();
    }
  }
  // voltageFirebaseService = inject(VoltageFirebaseService);
  // protected arrayOfVoltages!: VoltageInterface[]
  // ngOnInit() {
  //   this.voltageFirebaseService.getAllVoltageValues().subscribe(
  //     voltages => {
  //         console.log(voltages);
  //         // TODO save in indexedDB and local storage
  //         this.arrayOfVoltages=voltages;
  //     }
  //   )
  // }
}
