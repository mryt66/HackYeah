import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MockAuthService } from '../services/mock-auth.service';

/**
 * Interceptor obsługujący błędy HTTP
 * Używa MockAuthService (bez backendu)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const mockAuthService = inject(MockAuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error);

      switch (error.status) {
        case 401:
          // Nieautoryzowany - wyloguj i przekieruj do logowania
          console.warn('Unauthorized access - logging out');
          mockAuthService.logout();
          break;

        case 403:
          // Brak uprawnień
          console.warn('Forbidden access');
          router.navigate(['/dashboard']);
          break;

        case 404:
          console.warn('Resource not found');
          break;

        case 500:
          console.error('Server error');
          // Można pokazać globalny toast/notification
          break;

        case 0:
          // Network error
          console.error('Network error - server unreachable');
          break;

        default:
          console.error(`Error ${error.status}: ${error.message}`);
      }

      return throwError(() => error);
    })
  );
};
