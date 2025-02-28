import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NgIf, NgStyle} from "@angular/common";
import {first, interval, takeUntil, tap, timer} from 'rxjs'
import {ConstantsEnum } from '../../utils/constants';
import { ThemeService } from '../../services/theme.service';
@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [
    NgStyle,
    NgIf
  ],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SplashScreenComponent implements OnInit {

  // private splashIntervalBeginning = 2000; //original: 2000
  // private splashIntervalEnding = 3000;// original: 3000


  // private randomIntFromInterval = (min:number, max:number) :number => { // min and max included
  //   return Math.floor(Math.random() * (max - min + 1) + min);
  // }
  showSplash: boolean = true;
  scale: number = 1;
  opacity: number = 1 ;
  innerScale: number = 1.0;
  innerOpacity: number = 1 ;

  constructor(private themeService : ThemeService) {}

  ngOnInit(): void {
    
    // True = dark mode 
    const theme : boolean = this.themeService.getStoredThemePreference();
    this.themeService.toggleTheme(theme) //used to be updateTheme
    timer(ConstantsEnum.splashScreenDisplayTime - 400)
    .pipe(
      first(),

      tap(() => {
        this.scale = 3;
        this.opacity = 0
      })
    )
    .subscribe();

  }
}
