import { ChangeDetectionStrategy, Component, computed, inject, Injectable, OnInit, Signal, signal } from '@angular/core';
import { UptimeService } from '../../services/uptime.service';
import { catchError, combineLatest, concatMap, filter, interval, map, Observable, of, race, Subscription, switchMap, tap } from 'rxjs';
import { UptimeTransformPipe } from '../../pipes/uptime-transform.pipe';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IndexedDBService } from '../../services/indexed-db.service';
import { ConstantsEnum } from '../../utils/constants';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { GradientTextDirective } from '../../directives/gradient-text.directive';
import { fetchWithTimeout } from '../../utils/fetchWithTimeout';
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
 
  
  constructor(
    protected authService: AuthService,
    protected homeService: HomeService,
  ) {
   
  }


}
