import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User, UserRole, UserStatus, LoginRequest, LoginResponse } from '../models/user.model';

/**
 * Mock AuthService - logowanie bez backendu
 * Używa fake users w pamięci i fake JWT tokens
 */
@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  // Demo users
  private readonly DEMO_USERS = [
    {
      email: 'subject@example.com',
      password: 'password123',
      user: {
        id: 1,
        email: 'subject@example.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        pesel: '90010112345',
        peselLast4: '2345',
        role: UserRole.SUBJECT,
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date()
      }
    },
    {
      email: 'employee@uknf.gov.pl',
      password: 'password123',
      user: {
        id: 2,
        email: 'employee@uknf.gov.pl',
        firstName: 'Anna',
        lastName: 'Nowak',
        pesel: '85050512345',
        peselLast4: '2345',
        role: UserRole.UKNF_EMPLOYEE,
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-10'),
        lastLogin: new Date()
      }
    },
    {
      email: 'admin@uknf.gov.pl',
      password: 'password123',
      user: {
        id: 3,
        email: 'admin@uknf.gov.pl',
        firstName: 'Piotr',
        lastName: 'Wiśniewski',
        pesel: '80030112345',
        peselLast4: '2345',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date()
      }
    }
  ];

  constructor(private router: Router) {
    // Sprawdź czy jest zapisany użytkownik w localStorage
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Mock login - sprawdza credentials z DEMO_USERS
   * Wersja Observable (z opóźnieniem) dla kompatybilności z AuthService API
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Wykonaj synchroniczny mockLogin
    const result = this.mockLogin(credentials);
    
    // Zwróć jako Observable z symulacją opóźnienia (500ms)
    if (result) {
      return of(result).pipe(delay(500));
    } else {
      return throwError(() => new Error('Invalid credentials'));
    }
  }

  /**
   * Mock login - synchroniczna wersja
   */
  mockLogin(credentials: LoginRequest): LoginResponse | null {
    const demoUser = this.DEMO_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!demoUser) {
      return null;
    }

    // Generuj fake JWT token
    const fakeToken = this.generateFakeToken(demoUser.user);
    const fakeRefreshToken = this.generateFakeRefreshToken(demoUser.user);

    const response: LoginResponse = {
      token: fakeToken,
      refreshToken: fakeRefreshToken,
      user: demoUser.user,
      expiresIn: 3600 // 1 godzina
    };

    // Zapisz w localStorage
    this.saveToStorage(response);
    
    // Aktualizuj currentUser
    this.currentUserSubject.next(demoUser.user);

    return response;
  }

  /**
   * Login bez credentials - automatyczne logowanie jako admin
   */
  skipLogin(): void {
    const adminUser = this.DEMO_USERS[2]; // Admin
    const response = this.mockLogin({
      email: adminUser.email,
      password: adminUser.password
    });

    if (response) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Logout
   */
  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Czy użytkownik jest zalogowany
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Czy użytkownik ma daną rolę
   */
  hasRole(role: UserRole): boolean {
    return this.currentUserSubject.value?.role === role;
  }

  /**
   * Czy użytkownik ma którąkolwiek z podanych ról
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.currentUserSubject.value?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Getter dla aktualnego użytkownika
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Generuj fake JWT token
   */
  private generateFakeToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.email,
      userId: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1h
    }));
    const signature = btoa('fake-signature-' + user.id);
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Generuj fake refresh token
   */
  private generateFakeRefreshToken(user: User): string {
    return btoa('refresh-' + user.id + '-' + Date.now());
  }

  /**
   * Zapisz do localStorage
   */
  private saveToStorage(response: LoginResponse): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('access_token', response.token);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    }
  }

  /**
   * Pobierz zapisanego użytkownika
   */
  private getStoredUser(): User | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Wyczyść localStorage
   */
  private clearStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  }
}
