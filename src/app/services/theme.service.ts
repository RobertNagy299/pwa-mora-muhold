import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkTheme = new BehaviorSubject<boolean>(this.getStoredThemePreference());
  isDarkTheme = this.darkTheme.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  toggleTheme(isDarkTheme: boolean) {
    this.darkTheme.next(isDarkTheme);
    this.storeThemePreference(isDarkTheme);
  }

  public getStoredThemePreference(): boolean {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('isDarkTheme');
      return savedTheme !== null ? JSON.parse(savedTheme) : false;
    }
    return false;
  }

  private storeThemePreference(isDarkTheme: boolean): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('isDarkTheme', JSON.stringify(isDarkTheme));
    }
  }

  public updateTheme(isDark: boolean) {
      if (isPlatformBrowser(this.platformId) && document !== undefined && typeof document !== 'undefined') {
        const body = document.body;
        if (isDark) {
          body.classList.add('theme-dark');
          body.classList.remove('theme-light');
        } else {
          body.classList.add('theme-light');
          body.classList.remove('theme-dark');
        }
  
      }
  
  
    }
}

