import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {TemperatureFirebaseService} from '../../services/temperature-firebase.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ConstantsEnum} from '../../utils/constants';
import {GradientTextDirective} from '../../directives/gradient-text.directive';

@UntilDestroy()
@Component({
  selector: 'app-temperature-chart',
  standalone: true,
  imports: [
    MatIcon,
    MatButton,
    NgIf,
    GradientTextDirective
  ],
  templateUrl: './temperature-chart.component.html',
  styleUrl: './temperature-chart.component.scss'
})
export class TemperatureChartComponent implements OnInit, OnDestroy {

  private temperatureSubscription: Subscription | null = null;
  protected isLoggedIn = false;

  constructor(private authService: AuthService ,private temperatureChartService: TemperatureFirebaseService,
              private el: ElementRef) {}


  ngOnInit(): void {
    const canvas = this.el.nativeElement.querySelector('#realtimeTemperatureChart');

    // Initialize the chart
    this.temperatureChartService.createChart(canvas);

    // Fetch historical data and update the chart
    this.temperatureChartService.fetchHistoricalData(ConstantsEnum.dataLimit).then((historicalData) => {
      this.temperatureChartService.updateChart(historicalData);
    });
    // Listen for voltage updates and update the chart
    this.temperatureSubscription = this.temperatureChartService.listenForTemperatureUpdates().subscribe((data) => {
      this.temperatureChartService.updateChart(data);
    });

    // Check authentication status
    this.authService.authState$.pipe(untilDestroyed(this)).subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }
  // Method to trigger download for logged-in users
  async downloadTemperatureData(): Promise<void> {
    await this.temperatureChartService.downloadTemperatureData();
  }

  ngOnDestroy(): void {
    // Unsubscribe from the voltage updates when the component is destroyed
    if (this.temperatureSubscription) {
      this.temperatureSubscription.unsubscribe();
    }
  }
}
