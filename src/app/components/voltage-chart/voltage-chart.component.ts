import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import Chart from 'chart.js/auto';
import { debounceTime, filter, Subject, switchMap, takeUntil } from 'rxjs';
import { GradientTextDirective } from '../../directives/gradient-text.directive';
import { VoltageInterface } from '../../interfaces/VoltageInterface';
import { AuthService } from '../../services/auth.service';
import { VoltageFirebaseService } from '../../services/voltage-firebase.service';
import { ChartTypeEnum } from '../../utils/constants';

import { select, Store } from '@ngrx/store';
import { ArcElement, CategoryScale, Legend, LinearScale, LineController, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { MyStoreInterface } from '../../store/app.store';
import { fetchHistoricalVoltageData, startGeneratingVoltageData, startListeningForVoltageDataChanges, stopGeneratingVoltageData, stopListeningForVoltageDataChanges } from '../../store/voltage-features/voltage-feature.actions';
import { selectVoltageArray } from '../../store/voltage-features/voltage-feature.selector';
import { ChartFactory } from '../../utils/ChartFactory/CustomChartFactory';


@UntilDestroy()
@Component({
  selector: 'app-voltage-chart',
  standalone: true,
  imports: [
    MatIcon,
    MatButton,
    NgIf,
    GradientTextDirective,
    AsyncPipe,
  ],
  templateUrl: './voltage-chart.component.html',
  styleUrl: './voltage-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoltageChartComponent implements OnInit, OnDestroy {

  private clickSubject = new Subject<void>();
  private chart!: Chart;
  private onDestroy$ : Subject<void> = new Subject();

  constructor (
    protected readonly authService: AuthService,
    private readonly voltageFirebaseService: VoltageFirebaseService,
    private el: ElementRef,
    private readonly chartFactory: ChartFactory,
    private readonly store: Store<MyStoreInterface>,

  ) {
    Chart.register(LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, LineController);
  }

  ngOnInit(): void {

    // Initialize the chart
    const canvas = this.el.nativeElement.querySelector('#realtimeChart');
    this.chart = this.chartFactory.createChart(canvas, ChartTypeEnum.VOLTAGE);
    
    this.clickSubject.pipe(
      debounceTime(1200),
      switchMap(() => {
        return this.voltageFirebaseService.downloadData();
      }),
      takeUntil(this.onDestroy$)
    ).subscribe();
    
    
    // Fetch historical data and update the chart
    this.store.dispatch(fetchHistoricalVoltageData());
    this.store.pipe(select(selectVoltageArray)).pipe(
      filter((data) => data !== null),
      untilDestroyed(this)
    ).subscribe((data: VoltageInterface[]) => {
      this.voltageFirebaseService.updateChart(this.chart, data);
    });

    this.store.dispatch(startGeneratingVoltageData());

    // Listen for voltage updates and update the chart
    this.store.dispatch(startListeningForVoltageDataChanges());
  }

  // Method to trigger download for logged-in users
  downloadVoltageData(): void {
    this.clickSubject.next();
  }

  ngOnDestroy(): void {
    Chart.unregister(LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, LineController);
    this.chart.clear();
    this.chart.destroy();
    this.store.dispatch(stopGeneratingVoltageData());
    this.store.dispatch(stopListeningForVoltageDataChanges());
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }


}

