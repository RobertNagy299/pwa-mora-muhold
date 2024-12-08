import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {VoltageFirebaseService} from '../../services/voltage-firebase.service';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-voltage-chart',
  standalone: true,
  imports: [
    MatIcon,
    MatButton,
    NgIf
  ],
  templateUrl: './voltage-chart.component.html',
  styleUrl: './voltage-chart.component.scss'
})
export class VoltageChartComponent implements OnInit, OnDestroy {

  private voltageSubscription: Subscription | null = null;
  protected isLoggedIn = false;
  private readonly DATA_LIMIT = 30; // Number of readings to fetch

  constructor(private authService: AuthService ,private voltageChartService: VoltageFirebaseService,
              private el: ElementRef) {}


  ngOnInit(): void {
    const canvas = this.el.nativeElement.querySelector('#realtimeChart');

    // Initialize the chart
    this.voltageChartService.createChart(canvas);

    // Fetch historical data and update the chart
    this.voltageChartService.fetchHistoricalData(this.DATA_LIMIT).then((historicalData) => {
      this.voltageChartService.updateChart(historicalData);
    });
    // Listen for voltage updates and update the chart
    this.voltageSubscription = this.voltageChartService.listenForVoltageUpdates().subscribe((data) => {
      this.voltageChartService.updateChart(data);
    });

    // Check authentication status
    this.authService.authState$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }
  // Method to trigger download for logged-in users
  downloadVoltageData(): void {
    this.voltageChartService.downloadVoltageData();
  }

  ngOnDestroy(): void {
    // Unsubscribe from the voltage updates when the component is destroyed
    if (this.voltageSubscription) {
      this.voltageSubscription.unsubscribe();
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
