import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NgIf, NgStyle} from "@angular/common";

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
  private randomIntFromInterval = (min:number, max:number) :number => { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  showSplash: boolean = true;
  scale: number = 1;
  opacity: number = 1 ;
  innerScale: number = 0.0;
  innerOpacity: number = 0 ;
  ngOnInit(): void {
    setTimeout(() => {
      this.innerScale = 1;
      this.innerOpacity = 1;
    },100)
    setTimeout(() => {
      this.scale = 3;
      this.opacity = 0;
      setTimeout(() => {
        this.showSplash = !this.showSplash;
      }, 1500)

     // this.windowWidth = "-" + window.innerWidth + 'px';
    }, this.randomIntFromInterval(2000,3000))

  }
}
