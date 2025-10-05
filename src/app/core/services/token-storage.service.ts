import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { STORAGE_KEYS } from '../models/api.config';
import { User } from '../models/user.model';

/**
 * Service do zarządzania tokenami JWT w localStorage
 * Obsługuje SSR (Server Side Rendering) sprawdzając isPlatformBrowser
 */
@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Zapisuje access token
   */
  saveAccessToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    }
  }

  /**
   * Pobiera access token
   */
  getAccessToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
    return null;
  }

  /**
   * Zapisuje refresh token
   */
  saveRefreshToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    }
  }

  /**
   * Pobiera refresh token
   */
  getRefreshToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
    return null;
  }

  /**
   * Zapisuje dane użytkownika
   */
  saveUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }
  }

  /**
   * Pobiera dane użytkownika
   */
  getUser(): User | null {
    if (!this.isBrowser) return null;
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Usuwa wszystkie dane z localStorage (logout)
   */
  clearStorage(): void {
    if (this.isBrowser) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  /**
   * Sprawdza czy token jest wygasły (dekoduje JWT i sprawdza exp)
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return true;
      }
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    } catch (error) {
      return true;
    }
  }

  /**
   * Dekoduje JWT token (bez weryfikacji podpisu - tylko client-side)
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
