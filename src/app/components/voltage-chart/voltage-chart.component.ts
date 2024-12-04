import {Component, inject, OnInit} from '@angular/core';
import {VoltageFirebaseService} from '../../services/voltage-firebase.service';
import {VoltageInterface} from '../../interfaces/VoltageInterface';

@Component({
  selector: 'app-voltage-chart',
  standalone: true,
  imports: [],
  templateUrl: './voltage-chart.component.html',
  styleUrl: './voltage-chart.component.scss'
})
export class VoltageChartComponent implements OnInit {
  voltageFirebaseService = inject(VoltageFirebaseService);
  protected arrayOfVoltages!: VoltageInterface[]
  ngOnInit() {
    this.voltageFirebaseService.getAllVoltageValues().subscribe(
      voltages => {
          console.log(voltages);
          // TODO save in indexedDB and local storage
          this.arrayOfVoltages=voltages;
      }
    )
  }
}
