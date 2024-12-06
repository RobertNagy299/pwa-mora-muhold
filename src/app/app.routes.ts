import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard.service';
import { AllowOnlyLoggedInGuard } from './guards/logged-in.service';

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
    canActivate: [AuthGuard] // Guard to prevent logged-in users from accessing login
  },
  {
    path:"registration",
    loadComponent: () => import("./components/registration/registration.component").then(component => component.RegistrationComponent),
    canActivate: [AuthGuard] // Guard to prevent logged-in users from accessing registration
  },
  {
    path:"profile",
    loadComponent:() => import("./components/profile/profile.component").then(component => component.ProfileComponent),
    canActivate: [AllowOnlyLoggedInGuard] // Guard to allow only logged-in users
  },
  {
    path: "**",
    redirectTo: "home"
  }
];

