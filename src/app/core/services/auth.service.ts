import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { LoginRequest, LoginResponse, RegistrationRequest, User, UserRole } from '../models/user.model';
import { API_CONFIG } from '../models/api.config';
import { TokenStorageService } from './token-storage.service';

/**
 * Service do zarządzania uwierzytelnianiem
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    // Inicjalizacja z danymi z localStorage
    const storedUser = this.tokenStorage.getUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Getter dla aktualnego użytkownika
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Logowanie użytkownika
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
      credentials
    ).pipe(
      tap(response => {
        // Zapisz tokeny i dane użytkownika
        this.tokenStorage.saveAccessToken(response.token);
        this.tokenStorage.saveRefreshToken(response.refreshToken);
        this.tokenStorage.saveUser(response.user);
        this.currentUserSubject.next(response.user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Rejestracja nowego użytkownika (podmiot)
   */
  register(data: RegistrationRequest): Observable<any> {
    return this.http.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
      data
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Aktywacja konta po kliknięciu linku w emailu
   */
  activateAccount(token: string): Observable<any> {
    return this.http.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.ACTIVATE}`,
      { token }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Wylogowanie użytkownika
   */
  logout(): void {
    this.tokenStorage.clearStorage();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Sprawdza czy użytkownik jest zalogowany
   */
  isAuthenticated(): boolean {
    const token = this.tokenStorage.getAccessToken();
    if (!token) {
      return false;
    }
    return !this.tokenStorage.isTokenExpired(token);
  }

  /**
   * Sprawdza czy użytkownik ma określoną rolę
   */
  hasRole(role: UserRole): boolean {
    const user = this.currentUserValue;
    return user?.role === role;
  }

  /**
   * Sprawdza czy użytkownik ma jedną z podanych ról
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserValue;
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Odświeżenie tokena
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
      { refreshToken }
    ).pipe(
      tap(response => {
        this.tokenStorage.saveAccessToken(response.token);
        this.tokenStorage.saveRefreshToken(response.refreshToken);
        this.tokenStorage.saveUser(response.user);
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Obsługa błędów HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Wystąpił nieoczekiwany błąd';

    if (error.error instanceof ErrorEvent) {
      // Błąd po stronie klienta
      errorMessage = `Błąd: ${error.error.message}`;
    } else {
      // Błąd po stronie serwera
      switch (error.status) {
        case 400:
          errorMessage = 'Nieprawidłowe dane';
          break;
        case 401:
          errorMessage = 'Nieprawidłowy email lub hasło';
          break;
        case 403:
          errorMessage = 'Brak uprawnień';
          break;
        case 404:
          errorMessage = 'Nie znaleziono zasobu';
          break;
        case 500:
          errorMessage = 'Błąd serwera';
          break;
        default:
          errorMessage = error.error?.message || `Kod błędu: ${error.status}`;
      }
    }

    console.error('HTTP Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
