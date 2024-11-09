import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: "home",
    loadComponent: () => import("./components/home/home.component").then(component => component.HomeComponent)
  },
  {
    path: "voltage",
    loadComponent: () => import("./components/voltage-chart/voltage-chart.component").then(component => component.VoltageChartComponent),
  },
  {
    path: "temperature",
    loadComponent: () => import("./components/temperature-chart/temperature-chart.component").then(component => component.TemperatureChartComponent),
  },
  {
    path: "**",
    redirectTo: "home"
  }
];
