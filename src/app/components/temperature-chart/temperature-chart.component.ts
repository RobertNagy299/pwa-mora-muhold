import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, filter, Subject, switchMap, takeUntil } from 'rxjs';
import { GradientTextDirective } from '../../directives/gradient-text.directive';
import { AuthService } from '../../services/auth.service';
import { TemperatureFirebaseService } from '../../services/temperature-firebase.service';
import { ChartTypeEnum } from '../../utils/constants';

import { select, Store } from '@ngrx/store';
import { ArcElement, CategoryScale, Legend, LinearScale, LineController, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { Chart } from 'chart.js/auto';
import { TemperatureInterface } from '../../interfaces/TemperatureInterface';
import { MyStoreInterface } from '../../store/app.store';
import { fetchHistoricalTemperatureData, startGeneratingTemperatureData, startListeningForTemperatureDataChanges, stopGeneratingTemperatureData, stopListeningForTemperatureDataChanges } from '../../store/temperature-features/temperature-feature.actions';
import { selectTemperatureArray } from '../../store/temperature-features/temperature-feature.selector';
import { ChartFactory } from '../../utils/ChartFactory/CustomChartFactory';


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

  private onDestroy$ : Subject<void> = new Subject();
  private chart!: Chart;
  private clickSubject: Subject<void> = new Subject<void>();

  constructor (
    protected authService: AuthService,
    private temperatureFirebaseService: TemperatureFirebaseService,
    private el: ElementRef,
    private chartFactory: ChartFactory,
    private readonly store: Store<MyStoreInterface>,

  ) {
    Chart.register(LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, LineController);
  }

  ngOnInit(): void {
    const canvas = this.el.nativeElement.querySelector('#realtimeTemperatureChart');
    this.chart = this.chartFactory.createChart(canvas, ChartTypeEnum.TEMPERATURE);

    this.clickSubject.pipe(
      debounceTime(1200),
      switchMap(() => {
        return this.temperatureFirebaseService.downloadData();
      }),
      takeUntil(this.onDestroy$)
    ).subscribe();

    // Fetch historical data and update the chart

    this.store.dispatch(fetchHistoricalTemperatureData());
    this.store.pipe(select(selectTemperatureArray)).pipe(
      filter((data) => data !== null),
      untilDestroyed(this)
    ).subscribe((data: TemperatureInterface[]) => {
      this.temperatureFirebaseService.updateChart(this.chart, data);
    });

    this.store.dispatch(startGeneratingTemperatureData());

    // Listen for temperature updates and update the chart
    this.store.dispatch(startListeningForTemperatureDataChanges());
  }

  // Method to trigger download for logged-in users
  downloadTemperatureData(): void {
    this.clickSubject.next();
  }

  ngOnDestroy(): void {
    Chart.unregister(LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, LineController);
    this.chart.clear();
    this.chart.destroy();
    this.store.dispatch(stopGeneratingTemperatureData());
    this.store.dispatch(stopListeningForTemperatureDataChanges());
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
