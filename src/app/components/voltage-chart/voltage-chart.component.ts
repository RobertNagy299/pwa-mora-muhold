import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {VoltageFirebaseService} from '../../services/voltage-firebase.service';
import {Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ConstantsEnum} from '../../utils/constants';
import {GradientTextDirective} from '../../directives/gradient-text.directive';

@UntilDestroy()
@Component({
  selector: 'app-voltage-chart',
  standalone: true,
  imports: [
    MatIcon,
    MatButton,
    NgIf,
    GradientTextDirective
  ],
  templateUrl: './voltage-chart.component.html',
  styleUrl: './voltage-chart.component.scss'
})
export class VoltageChartComponent implements OnInit, OnDestroy {

  private voltageSubscription: Subscription | null = null;
  protected isLoggedIn = false;

  constructor(private authService: AuthService ,private voltageChartService: VoltageFirebaseService,
              private el: ElementRef) {}


  ngOnInit(): void {
    const canvas = this.el.nativeElement.querySelector('#realtimeChart');

    // Initialize the chart
    this.voltageChartService.createChart(canvas);

    // Fetch historical data and update the chart
    this.voltageChartService.fetchHistoricalData(ConstantsEnum.dataLimit).then((historicalData) => {
      this.voltageChartService.updateChart(historicalData);
    });
    // Listen for voltage updates and update the chart
    this.voltageSubscription = this.voltageChartService.listenForVoltageUpdates().subscribe((data) => {
      this.voltageChartService.updateChart(data);
    });

    // Check authentication status
    this.authService.authState$.pipe(untilDestroyed(this)).subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }
  // Method to trigger download for logged-in users
  async downloadVoltageData(): Promise<void> {
    await this.voltageChartService.downloadVoltageData();
  }

   ngOnDestroy(): void {
    // Unsubscribe from the voltage updates when the component is destroyed
    if (this.voltageSubscription) {
      this.voltageSubscription.unsubscribe();
    }
  }

}
