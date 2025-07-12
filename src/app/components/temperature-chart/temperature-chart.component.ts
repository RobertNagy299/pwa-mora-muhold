import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, filter, Subject, switchMap, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { AsyncPipe, NgIf } from '@angular/common';
import { TemperatureFirebaseService } from '../../services/temperature-firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ChartTypeEnum, Constants } from '../../utils/constants';
import { GradientTextDirective } from '../../directives/gradient-text.directive';

import { Chart } from 'chart.js/auto';
import { LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, LineController, PointElement, ArcElement } from 'chart.js';
import { ChartFactory } from '../../utils/ChartFactory/CustomChartFactory';
import { DataPointModel } from '../../services/chart-service';


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
export class TemperatureChartComponent implements OnInit, OnDestroy {

  private chart!: Chart;
  private clickSubject: Subject<void> = new Subject<void>()

  constructor(
    protected authService: AuthService,
    private temperatureChartService: TemperatureFirebaseService,
    private el: ElementRef,
    private chartFactory: ChartFactory,
  ) {
    Chart.register(LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, LineController)
  }

  ngOnInit(): void {
    const canvas = this.el.nativeElement.querySelector('#realtimeTemperatureChart');
    this.chart = this.chartFactory.createChart(canvas, ChartTypeEnum.TEMPERATURE);

    // Fetch historical data and update the chart
    this.clickSubject.pipe(
      debounceTime(1200),
      switchMap(() => {
        return this.temperatureChartService.downloadData()
      })
    ).subscribe()

    this.temperatureChartService.fetchHistoricalData(Constants.get('dataLimit'))
      .pipe(
        filter((data) => data !== undefined),
        tap((data: DataPointModel[]) => {
          this.temperatureChartService.updateChart(this.chart, data);
        })
      ).subscribe()

    // Listen for voltage updates and update the chart
    this.temperatureChartService.generateData().pipe(untilDestroyed(this)).subscribe()

    this.temperatureChartService.listenForUpdates()
      .pipe(
        filter((data) => data !== undefined),
        tap((data) => {
          this.temperatureChartService.updateChart(this.chart, data);
        }),
        untilDestroyed(this),
      ).subscribe()
  }

  // Method to trigger download for logged-in users
  downloadTemperatureData(): void {
    this.clickSubject.next();
  }

  ngOnDestroy(): void {
    Chart.unregister(LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, LineController);
    this.chart.clear();
    this.chart.destroy();
  }
}
