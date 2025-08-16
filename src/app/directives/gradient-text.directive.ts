import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appGradientText]',
  standalone: true
})
export class GradientTextDirective implements OnInit {
  @Input() color1: string = 'orange';
  @Input() color2: string = 'brown';
  @Input() duration: string = '3s'; // Default duration for the animation

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.applyGradient();
  }

  private applyGradient() {
    const element = this.el.nativeElement;

    this.renderer.setStyle(element, 'background', `linear-gradient(45deg, ${this.color1}, ${this.color2})`);
    this.renderer.setStyle(element, '-webkit-background-clip', 'text');
    this.renderer.setStyle(element, '-webkit-text-fill-color', 'transparent');
    this.renderer.setStyle(element, 'animation', `gradientAnimation ${this.duration} ease infinite`);
    this.renderer.setStyle(element, 'background-size', '200% 200%');

    const styleElement = this.renderer.createElement('style');
    const keyframes =
      `@keyframes gradientAnimation {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }`;

    this.renderer.appendChild(styleElement, this.renderer.createText(keyframes));
    this.renderer.appendChild(document.head, styleElement);
  }
}
