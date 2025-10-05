import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Auth layout - dla stron logowania i rejestracji
 * Prosty layout bez sidebar
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span class="text-white text-2xl font-bold">UK</span>
          </div>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          System Komunikacji UKNF
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Platforma komunikacji z podmiotami nadzorowanymi
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <router-outlet></router-outlet>
        </div>
      </div>

      <footer class="mt-8 text-center text-sm text-gray-500">
        <p>&copy; 2025 UKNF. Wszelkie prawa zastrzeżone.</p>
      </footer>
    </div>
  `
})
export class AuthLayoutComponent {}
