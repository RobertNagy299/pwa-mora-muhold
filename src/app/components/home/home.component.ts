import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { GradientTextDirective } from '../../directives/gradient-text.directive';
import { UptimeTransformPipe } from '../../pipes/uptime-transform.pipe';
import { AuthService } from '../../services/auth.service';
import { UptimeService } from '../../services/uptime.service';

@UntilDestroy()
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [UptimeTransformPipe, AsyncPipe, NgIf, GradientTextDirective],
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
 

  constructor(
    protected authService: AuthService,
    protected uptimeService: UptimeService,
  ) {
  }


}
