import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {debounceTime, filter, Subject, Subscription, switchMap, tap} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {AsyncPipe, NgIf} from '@angular/common';
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
    GradientTextDirective,
    AsyncPipe
  ],
  templateUrl: './temperature-chart.component.html',
  styleUrl: './temperature-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemperatureChartComponent implements OnInit {

  
  private clickSubject : Subject<void> = new Subject<void>()

  constructor(
    protected authService: AuthService,
    private temperatureChartService: TemperatureFirebaseService,
    private el: ElementRef) {}


  ngOnInit(): void {
    const canvas = this.el.nativeElement.querySelector('#realtimeTemperatureChart');

    // Initialize the chart
    this.temperatureChartService.createChart(canvas);

    // Fetch historical data and update the chart
    
   
    this.clickSubject.pipe(
      debounceTime(1200),

      switchMap(() => {
        return this.temperatureChartService.downloadTemperatureData()
      })
    ).subscribe()

    this.temperatureChartService.fetchHistoricalData(ConstantsEnum.dataLimit)
    .pipe(
      tap((data: TemperatureInterface[]) => {
        //console.log("data fetched historically =  " + data)
        this.temperatureChartService.updateChart(data);
      })
    ).subscribe()

    // Listen for voltage updates and update the chart

    this.temperatureChartService.generateTemperatureData().pipe(untilDestroyed(this)).subscribe()

    this.temperatureChartService.listenForTemperatureUpdates()
    .pipe(
      //tap((data) => console.log(`inside listenForTempUpdates in the component. Data = ${data} `)),

      filter((data) => data !== undefined),

      tap((data) => {
        this.temperatureChartService.updateChart(data);
      }),

      untilDestroyed(this),
    ).subscribe()

    
  }
  // Method to trigger download for logged-in users


  downloadTemperatureData() : void {
    this.clickSubject.next();
  }

 
}
