import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {VoltageFirebaseService} from '../../services/voltage-firebase.service';
import {map, Observable, of, Subscription, tap} from 'rxjs';
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
export class VoltageChartComponent implements OnInit, OnDestroy {

  private voltageSubscription: Subscription | null = null;
  
  constructor(
    protected authService: AuthService,
    private voltageFirebaseService: VoltageFirebaseService,
    private el: ElementRef,
  ) {}


  ngOnInit(): void {
    const canvas = this.el.nativeElement.querySelector('#realtimeChart');

    // Initialize the chart
    this.voltageFirebaseService.createChart(canvas);

    this.voltageFirebaseService.generateVoltageData().pipe(untilDestroyed(this)).subscribe();

    
    // Fetch historical data and update the chart
    
    /**
     * OLD BUT GOLD
     */

    // this.voltageChartService.fetchHistoricalData(ConstantsEnum.dataLimit).then((historicalData) => {
    //   this.voltageChartService.updateChart(historicalData);
    // });

    // ok
    this.voltageFirebaseService.fetchHistoricalData(ConstantsEnum.dataLimit)
    .pipe(
      tap((data: VoltageInterface[]) => {
      //  console.log(`inside historical fetch, data = ${JSON.stringify(data)}`) SEEMS FINE
        this.voltageFirebaseService.updateChart(data);
      })
    ).subscribe()


    // Listen for voltage updates and update the chart
    // old but gold
    // this.voltageSubscription = this.voltageChartService.listenForVoltageUpdates().subscribe((data) => {
    //   this.voltageChartService.updateChart(data);
    // });

    this.voltageSubscription = this.voltageFirebaseService.listenForVoltageUpdates()
    .pipe(
      tap((data: VoltageInterface[]) => {
        console.log(`Data inside voltageSubscription = ${JSON.stringify(data)}`); // ERROR, THIS SHOULD NOT BE UNDEFINED
        this.voltageFirebaseService.updateChart(data);
      })
    ).subscribe()


    // Check authentication status
   
  }
  // Method to trigger download for logged-in users
  
  /**OLD BUT GOLD */
  
  // async downloadVoltageData(): Promise<void> {
  //   await this.voltageChartService.downloadVoltageData();
  // }

  downloadVoltageData() : void {
     this.voltageFirebaseService.downloadVoltageData().subscribe();
  }

   ngOnDestroy(): void {
    // Unsubscribe from the voltage updates when the component is destroyed
    if (this.voltageSubscription) {
      this.voltageSubscription.unsubscribe();
    }
  }

}
