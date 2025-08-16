import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, signal, Type, WritableSignal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { filter, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { TemperatureChartComponent } from '../temperature-chart/temperature-chart.component';
import { VoltageChartComponent } from '../voltage-chart/voltage-chart.component';

declare type PossibleChartTypes = TemperatureChartComponent | VoltageChartComponent;

@Component({
  selector: 'app-chart-loader',
  standalone: true,
  imports: [
    MatProgressBarModule,
    NgComponentOutlet,
    AsyncPipe
  ],
  templateUrl: './chart-loader.component.html',
  styleUrl: './chart-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartLoaderComponent implements OnDestroy {

  private onDestroy$: Subject<void> = new Subject();

  protected chartComponent$: ReplaySubject<Type<PossibleChartTypes>> = new ReplaySubject(1);
  protected siteLoaded: WritableSignal<boolean> = signal(false);

  protected isTemp: boolean = false;

  constructor (
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof ActivationEnd),
      takeUntil(this.onDestroy$)
    ).subscribe(() => {
      const chartType = this.route.snapshot.routeConfig?.path;
      switch (chartType) {
        case 'temperature':
          this.isTemp = true;
          this.chartComponent$.next(TemperatureChartComponent);
          break;
        case 'voltage':
          this.chartComponent$.next(VoltageChartComponent);
          break;
      }
      this.siteLoaded.set(true);
    }
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
