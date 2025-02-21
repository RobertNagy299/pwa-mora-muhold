import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {filter, Subscription, tap} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {TemperatureFirebaseService} from '../../services/temperature-firebase.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ConstantsEnum} from '../../utils/constants';
import {GradientTextDirective} from '../../directives/gradient-text.directive';
import { TemperatureInterface } from '../../interfaces/TemperatureInterface';

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
  styleUrl: './temperature-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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
    
    // OLD BUT GOLD

    // this.temperatureChartService.fetchHistoricalData(ConstantsEnum.dataLimit).then((historicalData) => {
    //   this.temperatureChartService.updateChart(historicalData);
    // });

    this.temperatureChartService.fetchHistoricalData(ConstantsEnum.dataLimit).pipe(
      tap((data: TemperatureInterface[]) => {
        this.temperatureChartService.updateChart(data);
      })
    ).subscribe()

    // Listen for voltage updates and update the chart
    // OLD BUT GOLD??
    // this.temperatureSubscription = this.temperatureChartService.listenForTemperatureUpdates().subscribe((data) => {
    //   this.temperatureChartService.updateChart(data);
    // });

    this.temperatureSubscription = this.temperatureChartService.listenForTemperatureUpdates()
    .pipe(
      
      filter((data) => data !== undefined),

      tap((data) => {
        this.temperatureChartService.updateChart(data);
      })
    ).subscribe()

    // Check authentication status
    this.authService.authState$.pipe(untilDestroyed(this)).subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }
  // Method to trigger download for logged-in users
  
  // OLD BUT GOLD
  // async downloadTemperatureData(): Promise<void> {
  //   await this.temperatureChartService.downloadTemperatureData();
  // }

  downloadTemperatureData() : void {
    this.temperatureChartService.downloadTemperatureData().subscribe()
  }

  ngOnDestroy(): void {
    // Unsubscribe from the voltage updates when the component is destroyed
    if (this.temperatureSubscription) {
      this.temperatureSubscription.unsubscribe();
    }
  }
}
