import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { VoltageFirebaseService } from '../../services/voltage-firebase.service';
import { debounceTime, filter, map, Subject, switchMap, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ChartTypeEnum, Constants } from '../../utils/constants';
import { GradientTextDirective } from '../../directives/gradient-text.directive';
import { VoltageInterface } from '../../interfaces/VoltageInterface';
import { AsyncPipe } from '@angular/common';
import Chart from 'chart.js/auto';

import { LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, LineController } from 'chart.js';
import { ChartFactory } from '../../utils/ChartFactory/CustomChartFactory';
import { DataPointModel } from '../../services/chart-service';
import { select, Store } from '@ngrx/store';
import { MyStoreInterface } from '../../store/app.store';
import { fetchHistoricalVoltageData, startGeneratingData, startListeningForVoltageDataChanges, stopGeneratingData, stopListeningForVoltageDataChanges } from '../../store/voltage-features/voltage-feature.actions';
import { selectVoltageArray } from '../../store/voltage-features/voltage-feature.selector';


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

  private clickSubject = new Subject<void>()
  private chart!: Chart;

  constructor(
    protected readonly authService: AuthService,
    private readonly voltageFirebaseService: VoltageFirebaseService,
    private el: ElementRef,
    private readonly chartFactory: ChartFactory,
    private readonly store: Store<MyStoreInterface>,

  ) {
    Chart.register(LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, LineController)


  }


  ngOnInit(): void {

    // Initialize the chart
    const canvas = this.el.nativeElement.querySelector('#realtimeChart');
    this.chart = this.chartFactory.createChart(canvas, ChartTypeEnum.VOLTAGE);
    this.clickSubject.pipe(

      debounceTime(1200),

      switchMap(() => {
        return this.voltageFirebaseService.downloadData()
      })
    ).subscribe()
    // Fetch historical data and update the chart

  
    this.store.dispatch(fetchHistoricalVoltageData());
    this.store.pipe(select(selectVoltageArray)).pipe(

      filter((data) => data !== null),
      untilDestroyed(this)

    ).subscribe((data: VoltageInterface[]) => {
      this.voltageFirebaseService.updateChart(this.chart, data);
    })


    this.store.dispatch(startGeneratingData());

    
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
    this.store.dispatch(stopGeneratingData());
    this.store.dispatch(stopListeningForVoltageDataChanges());
  }


}

