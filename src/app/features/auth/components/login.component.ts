import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MockAuthService } from '../../../core/services/mock-auth.service';

/**
 * Komponent logowania z MockAuthService (bez backendu)
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div>
      <h3 class="text-2xl font-bold text-gray-900 mb-6">Zaloguj się</h3>

      <!-- Error message -->
      <div *ngIf="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-800">{{ errorMessage }}</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <!-- Email -->
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Adres email
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            placeholder="nazwa@example.com"
          />
          <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
             class="mt-1 text-sm text-red-600">
            Podaj prawidłowy adres email
          </p>
        </div>

        <!-- Password -->
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Hasło
          </label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            placeholder="••••••••"
          />
          <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
             class="mt-1 text-sm text-red-600">
            Hasło jest wymagane
          </p>
        </div>

        <!-- Remember me -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <input
              id="remember"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember" class="ml-2 block text-sm text-gray-700">
              Zapamiętaj mnie
            </label>
          </div>
          <a href="#" class="text-sm text-blue-600 hover:text-blue-800">
            Zapomniałeś hasła?
          </a>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          [disabled]="loginForm.invalid || loading"
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg *ngIf="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span *ngIf="!loading">Zaloguj się</span>
          <span *ngIf="loading">Logowanie...</span>
        </button>

        <!-- Skip Login button (dev only) -->
        <button
          type="button"
          (click)="onSkipLogin()"
          class="w-full mt-3 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-md transition-colors flex items-center justify-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
          Pomiń logowanie (Admin)
        </button>
      </form>

      <!-- Register link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Nie masz konta? 
          <a routerLink="/register" class="text-blue-600 hover:text-blue-800 font-medium">
            Zarejestruj się
          </a>
        </p>
      </div>

      <!-- Demo credentials (development only) -->
      <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p class="text-xs text-yellow-800 font-semibold mb-2">🔧 Tryb Development (Mock Auth):</p>
        <div class="text-xs text-yellow-700 space-y-1">
          <p><strong>Podmiot:</strong> subject&#64;example.com / password123</p>
          <p><strong>Pracownik:</strong> employee&#64;uknf.gov.pl / password123</p>
          <p><strong>Admin:</strong> admin&#64;uknf.gov.pl / password123</p>
          <p class="mt-2 text-yellow-600"><em>Lub użyj przycisku "Pomiń logowanie" aby zalogować się jako Admin</em></p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private mockAuthService: MockAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Mock login (bez backendu)
    const result = this.mockAuthService.mockLogin(this.loginForm.value);
    
    if (result) {
      // Sukces - przekieruj do dashboardu
      setTimeout(() => {
        this.loading = false;
        this.router.navigate([this.returnUrl]);
      }, 500); // Symulacja opóźnienia sieciowego
    } else {
      // Błąd - nieprawidłowe credentials
      this.errorMessage = 'Nieprawidłowy email lub hasło';
      this.loading = false;
    }
  }

  /**
   * Skip login - automatyczne logowanie jako Admin
   */
  onSkipLogin(): void {
    this.mockAuthService.skipLogin();
  }
}
