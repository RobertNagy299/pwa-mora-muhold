import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard.service';

export const routes: Routes = [
  
  {
    path: "home",
    loadComponent: () => import("./components/home/home.component").then(component => component.HomeComponent),
    // children: []
    title: "Móra Satellite - Home",
  },
  {
    path: "voltage",
    loadComponent: () => import("./components/chart-loader/chart-loader.component").then(component => component.ChartLoaderComponent),
    title: "Voltage Chart",
  },
  {
    path: "temperature",
    loadComponent: () => import("./components/chart-loader/chart-loader.component").then(component => component.ChartLoaderComponent),
    title: "Temperature Chart",
  },
  {
    path:"login",
    loadComponent: () => import("./components/login/login.component").then(component => component.LoginComponent),
    canActivate: [AuthGuard], // Guard to prevent logged-in users from accessing login
    title: "Log In",
  },
  {
    path:"registration",
    loadComponent: () => import("./components/registration/registration.component").then(component => component.RegistrationComponent),
    canActivate: [AuthGuard], // Guard to prevent logged-in users from accessing registration
    title: "Register",
  },
  {
    path:"profile",
    loadComponent:() => import("./components/profile/profile.component").then(component => component.ProfileComponent),
    canActivate: [AuthGuard], // Guard to allow only logged-in users
    title: "Profile",
  },
  {
    path: "**",
    redirectTo: "home"
  }
];

