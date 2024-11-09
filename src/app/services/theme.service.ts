import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkTheme = new BehaviorSubject<boolean>(this.getStoredThemePreference());
  isDarkTheme = this.darkTheme.asObservable();

  constructor() {}

  toggleTheme(isDarkTheme: boolean) {
    this.darkTheme.next(isDarkTheme);
    this.storeThemePreference(isDarkTheme);
  }

  private getStoredThemePreference(): boolean {
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
}

