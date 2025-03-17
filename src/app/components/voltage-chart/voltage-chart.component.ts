import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {VoltageFirebaseService} from '../../services/voltage-firebase.service';
import {debounceTime, filter, Subject, switchMap, tap} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ChartTypeEnum, ConstantsEnum} from '../../utils/constants';
import {GradientTextDirective} from '../../directives/gradient-text.directive';
import { VoltageInterface } from '../../interfaces/VoltageInterface';
import { AsyncPipe } from '@angular/common';
import Chart from 'chart.js/auto';

import { LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, LineController } from 'chart.js';
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

  private clickSubject = new Subject<void>()
  private chart!: Chart;
  
  constructor(
    protected authService: AuthService,
    private voltageFirebaseService: VoltageFirebaseService,
    private el: ElementRef,
    private chartFactory: ChartFactory
  ) {
    Chart.register(LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, LineController)
  }


  ngOnInit(): void {
    const canvas = this.el.nativeElement.querySelector('#realtimeChart');

    // Initialize the chart
    this.chart = this.chartFactory.createChart(canvas, ChartTypeEnum.VOLTAGE);
    
    this.clickSubject.pipe(
      
      debounceTime(1200),
      
      switchMap(() => {
        return this.voltageFirebaseService.downloadVoltageData()
      })
    ).subscribe()
    // Fetch historical data and update the chart

    // ok
    this.voltageFirebaseService.fetchHistoricalData(ConstantsEnum.dataLimit)
    .pipe(

      filter((data) => data !== undefined),

      tap((data: VoltageInterface[]) => {
        // CHANGED
      // console.log(`[voltageChart Component] Data inside FetchHistoricalData = ${JSON.stringify(data)}`); // ERROR, THIS SHOULD NOT BE UNDEFINED

        this.voltageFirebaseService.updateChart(this.chart, data);
      })
    ).subscribe()

    this.voltageFirebaseService.generateVoltageData().pipe(untilDestroyed(this)).subscribe();

    // Listen for voltage updates and update the chart
  

     this.voltageFirebaseService.listenForVoltageUpdates()
    .pipe(
      
      filter((data) => data !== undefined),

      tap((data: VoltageInterface[]) => {
       //console.log(`[voltageChart Component] Data inside voltageSubscription = ${JSON.stringify(data)}`); // ERROR, THIS SHOULD NOT BE UNDEFINED
        this.voltageFirebaseService.updateChart(this.chart, data);
      }),

      untilDestroyed(this),
    ).subscribe()


   
  }
  // Method to trigger download for logged-in users
  
  downloadVoltageData() : void {
    this.clickSubject.next();
  }

  ngOnDestroy(): void {
    Chart.unregister(LinearScale, CategoryScale, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, LineController);
    this.chart.clear();
    this.chart.destroy();
  }
 

}

