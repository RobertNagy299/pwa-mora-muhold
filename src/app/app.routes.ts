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
    path:"login",
    loadComponent: () => import("./components/login/login.component").then(component => component.LoginComponent),
  },
  {
    path:"registration",
    loadComponent: () => import("./components/registration/registration.component").then(component => component.RegistrationComponent),
  },
  {
    path: "**",
    redirectTo: "home"
  }
];
