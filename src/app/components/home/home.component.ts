import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UptimeTransformPipe } from '../../pipes/uptime-transform.pipe';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { GradientTextDirective } from '../../directives/gradient-text.directive';
import { HomeService } from '../../services/home-service.service';

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
 
 // protected currentUserFromStore$ : Observable<User | null>;

  constructor(
    protected authService: AuthService,
    protected homeService: HomeService,
  ) {
  // this.currentUserFromStore$ = this.store.pipe(select(selectCurrentUser))
  }


}
