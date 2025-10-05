import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';
import { HTTP_HEADERS } from '../models/api.config';

/**
 * Interceptor dodający JWT token do każdego requestu
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getAccessToken();

  // Dodaj token tylko jeśli istnieje i request nie jest do endpointu logowania
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/register')) {
    req = req.clone({
      setHeaders: {
        [HTTP_HEADERS.AUTHORIZATION]: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
