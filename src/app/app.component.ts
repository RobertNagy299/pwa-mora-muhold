import {Component, inject, OnDestroy} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashScreenComponent } from "./components/splash-screen/splash-screen.component";
import {MainComponent} from './components/main/main.component';
import {HomeComponent} from './components/home/home.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SplashScreenComponent, MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent    {
  title = 'Mora Satellite';
  
 
}
