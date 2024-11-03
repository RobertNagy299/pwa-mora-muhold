import {Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashScreenComponent } from "./components/splash-screen/splash-screen.component";
import {MainComponent} from './components/main/main.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SplashScreenComponent, MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent   {
  title = 'mora-muhold';

}
