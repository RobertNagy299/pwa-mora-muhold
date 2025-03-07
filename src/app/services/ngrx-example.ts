import { createSelector } from '@ngrx/store';
import { Observable } from 'rxjs';

export interface UserState {
    user: User;
    authSate: AuthState
}

export interface AppState {
    userState: UserState;
    temperatureState: TemperatureState;
}

export const selectUserState = (state: AppState) => state.userState;

export const selectUserDisplayName = createSelector(
    selectUserState,
    (state: UserState) => state.user.displayName
);

export const selectAuthState = createSelector(
    selectUserState,
    (state: UserState) => state.authSate
);

// -----------------------------------------------------


export const updateAuthState = createAction(
    '[User] Update authSate',
    props<{ authState: AuthState }>()
);

// -----------------------------------------------------


private readonly store = inject(Store);

//private readonly users = this.store.select(selectUsers); store.select is deprecated

private readonly users = this.store.pipe(
    select(selectAuthState),
);

// -----------------------------------------------------

@Injectable()
export class MoviesEffects {
    private actions$ = inject(Actions);
    private moviesService = inject(MoviesService);

    loadMovies$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(updateAuthState.type),
            tap(action => {
                action.payload.authSate
            })), // { type: '[User] Update authSate', payload: authState }

    );
}



// ---------------------------------------------

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, SplashScreenComponent, MainComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class TempComponent {
    title = 'Mora Satellite';
    constructor(private tempService: TempService) { }
    temp$ = this.tempService.fetch();
}


export interface TempService {
    fetch(): Observable<TempData>;
}


  @NgModule({
    
  })
  export class TempModule { }

// ---------------------------------------------


  @NgModule({
    
  })
  export class Module { }

export class StoreBasedTempService implements TempService {
    constructor(private store: Store) { }
    fetch(): TempData {

        temp$ = this.store.pipe(select(selectTemp));
        return temp$;
    }

}

export class IdbBasedTempService implements TempService {

}

