import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {VoltageFirebaseService} from '../../services/voltage-firebase.service';
import {debounceTime, filter, map, Observable, of, Subject, Subscription, switchMap, tap, throttleTime} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ConstantsEnum} from '../../utils/constants';
import {GradientTextDirective} from '../../directives/gradient-text.directive';
import { VoltageInterface } from '../../interfaces/VoltageInterface';
import { AsyncPipe } from '@angular/common';

@UntilDestroy()
@Component({
  selector: 'app-voltage-chart',
  standalone: true,
  imports: [
    MatIcon,
    MatButton,
    NgIf,
    GradientTextDirective,
    AsyncPipe
  ],
  templateUrl: './voltage-chart.component.html',
  styleUrl: './voltage-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoltageChartComponent implements OnInit {

  private clickSubject = new Subject<void>()
  
  constructor(
    protected authService: AuthService,
    private voltageFirebaseService: VoltageFirebaseService,
    private el: ElementRef,
  ) {}


  ngOnInit(): void {
    const canvas = this.el.nativeElement.querySelector('#realtimeChart');

    // Initialize the chart
    this.voltageFirebaseService.createChart(canvas);

    
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
      tap((data: VoltageInterface[]) => {
      //  console.log(`inside historical fetch, data = ${JSON.stringify(data)}`) SEEMS FINE
        this.voltageFirebaseService.updateChart(data);
      })
    ).subscribe()

    this.voltageFirebaseService.generateVoltageData().pipe(untilDestroyed(this)).subscribe();

    // Listen for voltage updates and update the chart
  

     this.voltageFirebaseService.listenForVoltageUpdates()
    .pipe(
      
      filter((data) => data !== undefined),

      tap((data: VoltageInterface[]) => {
      //  console.log(`Data inside voltageSubscription = ${JSON.stringify(data)}`); // ERROR, THIS SHOULD NOT BE UNDEFINED
        this.voltageFirebaseService.updateChart(data);
      }),

      untilDestroyed(this),
    ).subscribe()


   
  }
  // Method to trigger download for logged-in users
  
  downloadVoltageData() : void {
    this.clickSubject.next();
  }

 

}
